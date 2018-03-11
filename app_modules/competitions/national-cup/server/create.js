import matchMod from './../../../matches/server/api.js';
import { endSeason } from './endSeason.js';
var chance = new Chance();


function create() {
    var api = {collections, collection, seasons, season, scheduleRounds, scheduleRound, _updateTeamsCompetitions, _scheduleRound,
        _scheduleFirstRound, _endDate, _firstDate, _teams, _rounds, _startDate, _playingDates, _setMatches, _getMatches, _cupInfo };

    /**
     * Insert the NationalCups collections. Only needed to be ran for the initial set up
     */
    function collections() {
        console.log('collections to insert:', butils.general.countries().length);
        _.each(butils.general.countries(), function(country, i){
            api.collection(country);
            console.log('national cups inserted:', i+1, '/', butils.general.countries().length);
        });
    }

    function collection(country) {
        var col = {
            country: country,
            seasons: {},
            currentSeason: 1
        }

        NationalCups.insert(col);
    }

    /**
     * Goes through all national cups and run the season method on each
     */
    function seasons() {
        var nc = NationalCups.find().fetch();
        _.each(nc, function(cup, i){
            api.season(cup);
            console.log('inserting seasons', i+1, '/', nc.length);
        });
    }

    /**
     * Insert season object into the national cup passed.
     * Season number is the current season number from the db
     * It is also seeting the currentSeason value to the value from db
     */
    function season(cup) {
        var endDate = api._endDate();
        var firstDate = api._firstDate();
        var availableDates = butils.dates.available(firstDate, endDate, [1,2,3,4,5,6]);
        var season = GameInfo.findOne().season;

        var teams = api._teams(cup.country);
        var rounds = api._rounds(teams.length);
        var startDate = api._startDate(availableDates, rounds);
        var playingDates = api._playingDates(availableDates, startDate);

        var s = {
            teams: teams,
            info: {
                availableDates: availableDates,
                playingDates: playingDates,
                firstAvailableDate: firstDate,
                startDate: startDate,
                endDate: endDate, //day of the final - the wendsnday before the playoff. Based on this and the number of rounds, you can calculate the start date
                rounds: rounds, //based on number of teams
            },
            state: {
                registrationOpen: true, //this will be open up to 2 weeks before start date
                ended: false,
                nextRound: 0,
            },
            rounds: {}
        }

        if (teams.length >= 2) {
            NationalCups.update({_id: cup._id}, {$set: {
                ['seasons.'+season]: s,
                currentSeason: season
            }});
        } else {
            NationalCups.update({_id: cup._id}, {$set: {
                ['seasons.'+season]: null,
                currentSeason: season
            }});
        }


        api._updateTeamsCompetitions(teams, cup);
    }

    function scheduleRounds() {
        var nc = NationalCups.find().fetch();
        _.each(nc, function(cup, i){
            api.scheduleRound(cup);
            console.log('scheduling rounds', i+1, '/', nc.length);
        });
    }

    /**
     * Schedule season for cups that have the season defined. If there are less than 2 teams in the country, there will be no season
     */
    function scheduleRound(cup) {
        var cs = cup.currentSeason;
        var ses = cup.seasons[cs];
        if (!ses) return;

        var round = ses.state.nextRound+1;
        var date = ses.info.playingDates[round-1];

        if (round === 1) {
            api._scheduleFirstRound(ses.teams, round, date, cup);
        } else if(round > ses.info.rounds) {
            endSeason(cup);
        } else {
            api._scheduleRound(round, date, cup);
        }

    }

    function _updateTeamsCompetitions(teams, cup) {
        _.each(teams, function(team) {
            let setter = {};
            setter['competitions.nationalCup.seasons.'+cup.currentSeason] = {
                _id: cup._id,
                round: 1
            };
            setter['competitions.nationalCup.currentSeason'] = cup.currentSeason;
            Teams.update({_id: team}, {$set:setter});
        });
    }

    function _scheduleFirstRound(teams, roundNum, date, cup) {
        if (teams.length === 0 || teams.length === 1) {
            endSeason(cup, teams[0]);
            return;
        }

        var playingTeams = [];
        var nonPlaying = [];
        var numberOfPlayingTeams = 0;
        var log2 = butils.math.log2(teams.length);
        var intlog2 = Math.floor(log2);
        var matches = [];
        var round = {};
        var setter = {};

        if (intlog2 === log2) {
            playingTeams = chance.shuffle(teams);
        } else {
            numberOfPlayingTeams = (teams.length - Math.pow(2,intlog2)) * 2;
            let schuffelled = chance.shuffle(teams);

            playingTeams = schuffelled.splice(0,numberOfPlayingTeams);
            nonPlaying = schuffelled;
        }



        _setMatches(playingTeams, roundNum, date, cup);
        matches = api._getMatches(cup.currentSeason, roundNum, cup._id);

        round = {
            teams: playingTeams,
            matches: matches,
            matchesPlayed: 0,
            date: date,
            winners: nonPlaying
        }
        setter['seasons.'+cup.currentSeason+'.rounds.'+ roundNum] = round;
        setter['seasons.'+cup.currentSeason+'.state.nextRound'] = roundNum;

        NationalCups.update({_id: cup._id}, {$set:setter});
    }

    function _scheduleRound(nextRoundNum, date, cup) {
        var playingTeams = [];
        var matches = [];
        var setter = {};

        playingTeams = chance.shuffle(api._cupInfo(cup).round.winners);
        _setMatches(playingTeams, nextRoundNum, date, cup);
        matches = api._getMatches(cup.currentSeason, nextRoundNum, cup._id);

        var round = {
            teams: playingTeams,
            matches: matches,
            matchesPlayed: 0,
            date: date,
            winners: []
        }
        setter['seasons.'+cup.currentSeason+'.rounds.'+ nextRoundNum] = round;
        setter['seasons.'+cup.currentSeason+'.state.nextRound'] = nextRoundNum;

        NationalCups.update({_id: cup._id}, {$set:setter});
    }

    function _setMatches(teams, round, date, cup) {
        // var matches = [];
        var info = {
            collection: 'NationalCups',
            _id: cup._id,
            season: cup.currentSeason,
            round: round,
            type: 'Cup',
            stage: 'Cup'
        };

        for (var i=0; i<teams.length/2; i++) {
            let matchID = matchMod.setMatch(teams[i*2], teams[i*2+1], null, date, null, info);
            // matches.push(matchID);
        }

        // return matches;
    }

    function _getMatches(cs, round, cupID) {
        var ids = [];
        var matches = Matches.find({'competition.collection': 'NationalCups',
            'competition._id': cupID, 'competition.season': cs, 'competition.round': round}, {fields:{_id:true}}).fetch();

        _.each(matches, function(match){
            ids.push(match._id);
        });

        return ids;
    }

    /**
     * Returns 11 March for now.
     * Usually would return last Monday of the season, before the playoff would take place
     * Format: YYYY-MM-DD
     */
    function _endDate() {
        //11 martie
        return '2017-09-29';
    }

    /**
     * Returns 22 February for now.
     * Usually would return first Monday of the season
     * Format: YYYY-MM-DD
     */
    function _firstDate() {
        return '2017-09-18';
    }

    /**
     * Return available participating teams
     * @param  {[type]} country [description]
     * @return {[type]}         [description]
     */
    function _teams(country) {
        var teams = [];
        var userInfo = UserInfo.find({}, {fields: {team_id: true}}).fetch();
        var activeTeams = [];
        _.each(userInfo, function(user){
            activeTeams.push(user.team_id);
        });

        var teamObjs = Teams.find({country: country, _id: {$in: activeTeams}}, {fields: {_id: true}}).fetch();
        _.each(teamObjs, function(team){
            teams.push(team._id);
        });

        return teams;
    }

    /**
     * Returns number of rounds needed based on number of participating teams
     * Ex: numTeams = 8 => 3
     *     numTeams = 9 => 4
     *     numTeams = 16 => 4
     */
    function _rounds(numTeams) {
        if (numTeams === 0 || numTeams === 1) return 0;
        if (numTeams === 2) return 1;

        var log = butils.math.log2(numTeams);
        if (log === parseInt(log, 10)) {
            return log;
        } else {
            return Math.floor(log) + 1;
        }
    }



    /**
     * The start date needs to be
     */
    function _startDate(availableDates, rounds) {
        var startDate = '';
        if (rounds === 0) {
            startDate = availableDates.reverse()[rounds];
        } else {
            startDate = availableDates.reverse()[rounds-1];
        }
        availableDates.reverse();

        return startDate;
    }

    /*Returns all dates between first playing date and last available date*/
    function _playingDates(availableDates, startRound) {
        return availableDates.splice(availableDates.indexOf(startRound), availableDates.length);
    }

    function _cupInfo(cup) {
        var cs = cup.currentSeason;
        // var cs = 23; //remove this after the update
        var cr = cup.seasons[cs].state.nextRound;
        return {
            cs: cs,
            cr: cr,
            season: cup.seasons[cs],
            round: cup.seasons[cs].rounds[cr]
        }
    }

    return api;
}

export default create();