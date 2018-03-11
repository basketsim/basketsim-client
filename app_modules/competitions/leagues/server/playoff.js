import Chance from 'chance';
import matchMod from './../../../matches/server/api.js'
/**
 * 2nd placed team from each league (except first) plays a game against one of the last 3 placed teams from above league.
 */
function playoff() {
    var api = {schedule, reset, play, updateAll, update, _getMinLeagueLevel, _getPromotingTeamsPerLevel, _getRelegatingTeamsPerLevel, _getLeagueChanges,
        _schedule, _getActivePerLevel, _insertPlayoff, _scheduleMatch};

    var chance = new Chance();

    function schedule() {
        var countries = butils.general.countries();
        // var countries = ['Romania'];
        var leagues = [];
        var currSeason = 0;
        var minLevel = 1;

        _.each(countries, function(country, i){
            leagues = Leagues.find({country:country}).fetch();
            currSeason = GameInfo.findOne().season;
            minLevel = api._getMinLeagueLevel(leagues, currSeason);
            api._schedule(country, leagues, currSeason, minLevel);
            console.log('Playoff schedule country', country, i+1, '/', countries.length);
        });


        Playoffs.find({season:currSeason}).forEach(function (playoff) {
            api._scheduleMatch(playoff);
        });
    }

    function reset() {
        var currSeason = GameInfo.findOne().season;

        Matches.remove({'competition.collection':'Playoffs', 'competition.season':currSeason});
        Playoffs.remove({season:currSeason});
        // schedule();
    }

    function play() {
        var season = GameInfo.findOne().season;
        var matches = Matches.find({'competition.collection':'Playoffs', 'competition.season':season}).fetch();
        _.each(matches, function(match, i){
            Meteor.call('geInit', match);
            console.log('simulated playoffMatches matches: ', i+1, '/', matches.length);
        });
    }

    function updateAll() {
        var season = GameInfo.findOne().season;
        var matches = Matches.find({ "competition.collection":"Playoffs" , "competition.season":season});
        var mlength = matches.count();
        matches.forEach(function (match, i) {
            api.update(match);
            console.log('updated playoff matches', i+1, '/', mlength);
        });
    }

    /*update score in the playoff object corresponding to the match*/
    function update(match) {
        Playoffs.update({_id: match.competition._id}, {$set:{
            homescore: match.homeTeam.matchRatings.score,
            awayscore: match.awayTeam.matchRatings.score
        }});
        Matches.update({_id: match._id}, {$set:{'state.finished':true}});
    }

    /**
     * 1. For each level get all relegating and promoting teams
     * 2. Create new league object for next season after subtracting the promoting/relegatig
     * 3. Add promoting/relegating from other levels to next league object
     *
     * CHECK THIS OUT: http://localhost:3000/national/leagues/australia/2/3/22
     */
    function _schedule(country, leagues, currSeason, minLevel) {
        var activeLeaguesPerLevel = api._getActivePerLevel(leagues, minLevel);
        var playoffTeams = api._getLeagueChanges(activeLeaguesPerLevel, currSeason, minLevel);
        var series = [];
        var season = GameInfo.findOne().season

        for (var i=1; i<minLevel; i++) {
            _.each(playoffTeams.relegating[i], function(relegatingTeam, j) {
                let promotingTeam = playoffTeams.promoting[i+1][j];
                api._insertPlayoff(country, season, relegatingTeam, promotingTeam);
            });
        }
    }

    /**
     * Insert playoff entry and schedule match
     * @param  {string} country
     * @param  {Object} relegatingTeam
     * @param  {Object} promotingTeam
     */
    function _insertPlayoff(country, season, relegatingTeam, promotingTeam) {
        Playoffs.insert({
          team1_id: relegatingTeam._id,
          name1: relegatingTeam.name,
          team2_id: promotingTeam._id,
          name2: promotingTeam.name,
          country: country,
          season: season,
          homescore: 0,
          awayscore: 0
        });
    }

    /**
     * Date should be changed before matches are schedulled
     * @param  {[type]} playoff [description]
     * @return {[type]}         [description]
     */
    function _scheduleMatch(playoff) {
        console.log('schedule playoff match');
        var info = {
            collection: 'Playoffs',
            _id: playoff._id,
            season: playoff.season,
            type: 'Playoffs',
            stage: 'Playoffs'
        };
        var date = moment().day(7).format('YYYY-MM-DD');

        matchMod.setMatch(playoff.team1_id, playoff.team2_id, null, date, null, info);

    }

    function _getMinLeagueLevel(leagues, currSeason) {
        var minLevel = 1;

        _.each(leagues, function(league){
            if (league.level > minLevel && league.seasons[currSeason] && league.seasons[currSeason].teams[0]) {
                minLevel = league.level;
            }
        });

        return minLevel;
    }

    /**
     * General Promotion Rules:
     */
    function _getPromotingTeamsPerLevel(activeLeaguesPerLevel, currSeason, level, minLevel) {
        if (level === 1) return [];
        var teams = [];
        var promoting = [];
        var series = activeLeaguesPerLevel[level];

        _.each(series, function(group){
            teams = _.sortBy(_.sortBy(_.sortBy(group.seasons[currSeason].teams, 'scored'), 'difference'), 'win').reverse();
            _checkEquality(teams);
            promoting.push(teams[1]);
        });

        return chance.shuffle(promoting);
    }

    function _getRelegatingTeamsPerLevel(activeLeaguesPerLevel, currSeason, level, minLevel) {
        if (level === minLevel) return [];
        var teams = [];
        var relegating = [];
        var series = activeLeaguesPerLevel[level];

        _.each(series, function(group){
            teams = _.sortBy(_.sortBy(_.sortBy(group.seasons[currSeason].teams, 'scored'), 'difference'), 'win');
            for (var i=3; i<6; i++) {
                relegating.push(teams[i]);
            }
        });

        return chance.shuffle(relegating);
    }

    function _checkEquality(teams) {
        for (var i=0; i<teams.length-1; i++) {
            if (teams[i].win === teams[i+1].win && teams[i].difference === teams[i+1].difference) {
                if (teams[i].scored === teams[i+1].scored) {
                    console.log('teams are the same and also their scored points', teams[i], teams[i+1]);
                }
            }
        }
    }

    /**
     * Returns promoting and relegating teams per each level
     */
    function _getLeagueChanges(activeLeaguesPerLevel, currSeason, minLevel) {
        var changes = {
            promoting: {
                1: [],
                2: []
            },
            relegating: {
                1: [],
                2: []
            }
        };

        for (var i=1; i<=minLevel; i++) {
            changes.promoting[i] = api._getPromotingTeamsPerLevel(activeLeaguesPerLevel, currSeason, i, minLevel);
            changes.relegating[i] = api._getRelegatingTeamsPerLevel(activeLeaguesPerLevel, currSeason, i, minLevel);
        }

        return changes;

    }

    function _getActivePerLevel(leagues, minLevel) {
        var activeLeaguesPerLevel = {};
         for (var i=1; i<=minLevel; i++) {
            activeLeaguesPerLevel[i] = [];
            _.each(leagues, function(league){
                if (league.level === i) {
                    activeLeaguesPerLevel[i].push(league);
                }
            });
        }

        return activeLeaguesPerLevel;
    }

    return api;
}

export default playoff();