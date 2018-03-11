import model from './models/model.js';
import teamsModel from './../../../teams/server/model.js';
import playoffModel from './models/playoff-model.js';
import Chance from 'chance';
import { Mongo } from 'meteor/mongo';
import newsApi from './../../../news/server/api.js';
import achivementsModel from './../../../achievements/server/model.js';
import finances from './../../../finances/server/api.js';

function seasonUpdates() {
    var api = {endRegularSeason, getCountryStatus, validate, setScoreDifference, insertPlayoff, sendRewards, reschedulePlayoffMatches,
        _validateCountryStatus, _matchPromotingToRelegating, _relProLevel, _relegateTeamsPerLevel, _insertPlayoff, _sendRewards, _sendPromotionNews,
        _assignFans, _assignTrophies, _assignMoneyPrize, _assignChampion, _directPromotion, _playoffPromotion, _promoteTeamsPerLevel, _setScoreDifference, _sendPlayoffNews};

    var chance = new Chance();
    /**
     * Runs after last round of the season. Does the following:
     * Update all teams to contain the score difference
     * Gets the country status
     * Validate that the country status is right
     * Schedule Playoff matches
     * Send money, fans and trophies based on the position
     * Send news
     */
    function endRegularSeason(testCountries) {
        console.log('endRegularSeason started');
        var countries = butils.general.countries();
        var allPlayoff = [];
        if (testCountries) countries = testCountries;

        var seasonNum = GameInfo.findOne().season;
        _.each(countries, function(country, i){
            console.log(`${country} - starting regular season updates (endRegularSeason), ${i+1}/${countries.length}`);
            let leagues = Leagues.find({country: country}).fetch();
            let maxLevel = model.getMinLeagueLevel(leagues, seasonNum);
            let ct = api.getCountryStatus(leagues, seasonNum);

            console.log(`   - setting score difference`);
            api._setScoreDifference(seasonNum, leagues)

            console.log(`   - validating country status`);
            api._validateCountryStatus(country, ct, maxLevel);

            console.log(`   - sending promoting news`);
            api._sendPromotionNews(ct, maxLevel);

            console.log(`   - inserting playoffs`);
            api._insertPlayoff(country, ct, maxLevel, seasonNum);

            console.log(`   - sending rewards`);
            api._sendRewards(leagues, maxLevel, seasonNum);

            console.log(`${country} - finished regular season updates (endRegularSeason), ${i+1}/${countries.length}`);
            console.log(' ');
        });

        /* Schedule Playoff Matches */
        allPlayoff = Playoffs.find({season: seasonNum});
        playoffModel.scheduleMulti(allPlayoff);
        api._sendPlayoffNews(allPlayoff);
        console.log('endRegularSeason ended');
    }

    function insertPlayoff(testCountries) {
        console.log('insertPlayoff started');
        var countries = butils.general.countries();
        if (testCountries) countries = testCountries;

        var seasonNum = GameInfo.findOne().season;
        _.each(countries, function(country, i){
            let leagues = Leagues.find({country: country}).fetch();
            let maxLevel = model.getMinLeagueLevel(leagues, seasonNum);

            api._setScoreDifference(seasonNum, leagues)
            let ct = api.getCountryStatus(leagues, seasonNum);
            api._validateCountryStatus(country, ct, maxLevel);
            api._sendPromotionNews(ct, maxLevel);
            api._insertPlayoff(country, ct, maxLevel, seasonNum);
            console.log(`insertPlayoff progress ${country}, ${i+1}/${countries.length}`);
        });
        /* Schedule Playoff Matches */
        console.log('insertPlayoff - schedule playoff matches');
        const allPlayoff = Playoffs.find({season: seasonNum});
        playoffModel.scheduleMulti(allPlayoff);
        /* Send news */
        console.log('insertPlayoff - send playoff news');
        api._sendPlayoffNews(allPlayoff);
        console.log('insertPlayoff ended');
    }

    function reschedulePlayoffMatches() {
        const seasonNum = GameInfo.findOne().season;
        const allPlayoff = Playoffs.find({season: seasonNum});
        Matches.remove({'competition.season':seasonNum, 'competition.collection':'Playoffs'});
        playoffModel.scheduleMulti(allPlayoff);
    }

    function sendRewards(testCountries) {
        console.log('sendRewards started');
        var countries = butils.general.countries();
        if (testCountries) countries = testCountries;

        var seasonNum = GameInfo.findOne().season;
        _.each(countries, function(country, i){
            let leagues = Leagues.find({country: country}).fetch();
            let maxLevel = model.getMinLeagueLevel(leagues, seasonNum);

            api._sendRewards(leagues, maxLevel, seasonNum);
            console.log(`sendRewards progress ${country}, ${i+1}/${countries.length}`);
        });

        console.log('sendRewards ended');
    }

    function validate(testCountries) {
        console.log('validation started');
        var countries = butils.general.countries();
        if (testCountries) countries = testCountries;

        var seasonNum = GameInfo.findOne().season;
        _.each(countries, function(country, i){
            let leagues = Leagues.find({country: country}).fetch();
            let maxLevel = model.getMinLeagueLevel(leagues, seasonNum);
            let ct = api.getCountryStatus(leagues, seasonNum);

            api._validateCountryStatus(country, ct, maxLevel);
            console.log(`validation progress ${i+1}/${countries.length}`);
        });
        console.log('validation ended');
    }

    function setScoreDifference(testCountries) {
        console.log('setScoreDifference started');
        var countries = butils.general.countries();
        if (testCountries) countries = testCountries;

        var seasonNum = GameInfo.findOne().season;
        _.each(countries, function(country, i){
            let leagues = Leagues.find({country: country}).fetch();
            let maxLevel = model.getMinLeagueLevel(leagues, seasonNum);

            api._setScoreDifference(seasonNum, leagues)
            console.log(`setScoreDifference progress ${i+1}/${countries.length}`);
        });
        console.log('setScoreDifference ended');
    }

    /**
     * For each league, add the score difference to every team.
     * Do this on season end
     */
    function _setScoreDifference(cs, leagues) {
        leagues.forEach(function (league, i) {
            if (league.seasons[cs]) {
                let setter = {};
                let teams = league.seasons[cs].teams;

                _.each(teams, function(team){
                    team.difference = team.scored - team.against;
                });

                Leagues.update({_id: league._id}, {$set:
                    {['seasons.'+cs+'.teams']: teams}
                });
            }
        });
    }

    /**
     * Gets playoff matches and insterts them in db
     */
    function _insertPlayoff(country, ct, maxLevel, seasonNum) {
        var rel = [];
        var pro = [];
        var playoffList = [];
        var relTeams = null;
        var proTeams = null;
        for (var i=1; i<maxLevel; i++) {
            let lower = i + 1;
            rel = ct[i.toString()].relegating.playoff.map(function(strID){ return new Mongo.ObjectID(strID); });
            pro = ct[lower.toString()].promoting.playoff.map(function(strID){ return new Mongo.ObjectID(strID); });
            relTeams = Teams.find({_id: {$in: rel}}, {fields: {name:1}}).fetch();
            proTeams = Teams.find({_id: {$in: pro}}, {fields: {name:1}}).fetch();
            // console.log(`_insertPlayoff rel:${relTeams}, pro:${proTeams}`);
            if (relTeams) {
                relTeams = chance.shuffle(relTeams);
                proTeams = chance.shuffle(proTeams);

                _.each(relTeams, function(r, j){
                    playoffList.push(playoffModel.create(country, seasonNum, r, proTeams[j]));
                });
            } else {
                console.log(country, 'has no playoff relegation teams');
                console.log('and it has promoting teams:', proTeams);
            }
        }
        /* Insert Playoff */
        if (playoffList.length > 0) {
            playoffModel.insertMulti(playoffList);
        } else {
            // console.log(`${country} had no playoff matches defined`);
        }
    }

    /**
     * Goes through the passed leagues, if current season has teams, assign money, trophies and fans
     * @param  {[type]} leagues   [description]
     * @param  {[type]} maxLevel  [description]
     * @param  {[type]} seasonNum [description]
     * @return {[type]}           [description]
     */
    function _sendRewards(leagues, maxLevel, seasonNum) {
        leagues.forEach(function (league) {
            if (league.seasons[seasonNum] && league.seasons[seasonNum].teams && league.seasons[seasonNum].teams.length === 14) {
                api._assignMoneyPrize(league, seasonNum);
                api._assignTrophies(league, seasonNum);
                api._assignFans(league, seasonNum);
            }
        });
    }

    function _assignMoneyPrize(league, seasonNum) {
        var rewardTable = {
            1: [1500, 1200, 900, 750, 600, 500, 450, 400, 200, 200, 200, 200, 200, 200],
            2: [900, 550, 550, 500, 450, 400, 350, 300, 150, 150, 150, 150, 150, 150],
            3: [800, 450, 450, 410, 370, 330, 290, 250, 120, 120, 120, 120, 120, 120],
            4: [700, 350, 350, 320, 290, 260, 230, 200, 100, 100, 100, 100, 100, 100],
            5: [600, 300, 300, 260, 220, 180, 140, 100, 75, 75, 75, 75, 75, 75]
        };
        var reward = 0;

        var teams = _.sortBy(_.sortBy(_.sortBy(league.seasons[seasonNum].teams, 'scored'), 'difference'), 'win').reverse();
        _.each(teams, function(team, place){
            reward = rewardTable[league.level][place] * 1000;
            Teams.update({_id: team.team_id}, {$inc: {curmoney: reward}}, function(){});
            finances.spending.update(team.team_id);

            newsApi.game.leagueEnd(team.team_id, league.name, league.country, place+1, reward);
        });
    }

    function _assignTrophies(league, seasonNum) {
        achivementsModel.insertLeagueTrophy(league, seasonNum);
    }

    function _assignFans(league, seasonNum) {
        var rewardTable = {
            1: [100, 80, 60, 50, 40, 30, 20, 10, -20, -20, -20, -30, -30, -30],
            2: [60, 50, 40, 30, 20, 10, 5, 5, -10, -10, -10, -15, -15, -15],
            3: [40, 30, 20, 15, 10, 8, 4, 4, -8, -8, -8, -12, -12, -12],
            4: [20, 15, 12, 10, 8, 6, 3, 3, -5, -5, -5, -10, -10, -10],
            5: [15, 12, 10, 8, 8, 6, 4, 2, -2, -2, -2, -5, -5, -5]
        };
        var reward = 0;

        var teams = _.sortBy(_.sortBy(_.sortBy(league.seasons[seasonNum].teams, 'scored'), 'difference'), 'win').reverse();
        _.each(teams, function(team, place){
            reward = rewardTable[league.level][place];
            Arenas.update({team_id: team.team_id}, {$inc: {fans: reward}}, function(){});

            newsApi.game.leagueEndFans(team.team_id, league.name, league.country, place+1, reward);
        });
    }

    /**
     * [getCountryStatus description]
     * @param  {array}  list of leagues, by country
     * @param  {number} seasonNum The season for which to get the country status
     * @return {object} For each level, return the promoting and relegating teams
     */
    function getCountryStatus(leagues, seasonNum) {
        var minLevel = model.getMinLeagueLevel(leagues, seasonNum);
        var countryStatus = {};
        var playoffTeams = {};
        var botTeams = model.getBotTeams(leagues, minLevel, seasonNum); //get all bot teams, at all levels
        for (var i=1; i<=minLevel; i++) {
            countryStatus[i] = api._relProLevel(i, seasonNum, leagues, botTeams, minLevel, countryStatus[i-1]);
            api._promoteTeamsPerLevel(countryStatus, i, leagues, botTeams, seasonNum);
        }

        api._matchPromotingToRelegating(countryStatus, minLevel, botTeams);

        return countryStatus;
    }
    /**
     * Check if number of relegated teams from above are equal to promoting from below
     * @param  {object} countryStatus [description]
     * @return {boolean}               [description]
     */
    function _validateCountryStatus(country, countryStatus, maxLevel) {
        for (var i=2; i<=maxLevel; i++) {
            let prev = i-1;
            let relDirL = countryStatus[prev.toString()].relegating.direct.length;
            let proDirL = countryStatus[i.toString()].promoting.direct.length;
            let relPlayL = countryStatus[prev.toString()].relegating.playoff.length;
            let proPlayL = countryStatus[i.toString()].promoting.playoff.length;
            if (relDirL !== proDirL) {
                console.log(`Direct relegation from ${prev} (length: ${relDirL}) not matching promotion in ${i} (length: ${proDirL}) for ${country}`);
                throw new Meteor.Error("direct-not-matching", `Direct relegation from ${prev} not matching promotion in ${i} for ${country}`);
            }
            if (relPlayL !== proPlayL) {
                console.log(`Playoff relegation from ${prev} (length: ${relPlayL}) not matching promotion in ${i} (length: ${proPlayL}) for ${country}`);
                throw new Meteor.Error("playoff-not-matching", `Playoff relegation from ${prev} not matching promotion in ${i} for ${country}`);
            }
        }
    }

    function _matchPromotingToRelegating(countryStatus, maxLevel, botTeams) {
        var chance = new Chance();
        for (var i=2; i<=maxLevel; i++) {
            let prev = i-1;
            let relDirect = countryStatus[prev.toString()].relegating.direct;
            let proDirect = countryStatus[i.toString()].promoting.direct;
            let relPlay = countryStatus[prev.toString()].relegating.playoff;
            let proPlay = countryStatus[i.toString()].promoting.playoff;
            let diffDirect = relDirect.length - proDirect.length; // represents the number of teams to be excluded from rel array
            let diffPlay = relPlay.length - proPlay.length; // represents the number of teams to be excluded from rel array

            if (diffDirect > 0) {
                let activeTeams = _.difference(relDirect, botTeams);
                activeTeams = chance.shuffle(activeTeams);
                let saved = activeTeams.slice(0, diffDirect);
                let extraSaved = diffDirect - saved.length;
                relDirect = _.difference(relDirect, saved);
                relDirect.splice(0,extraSaved);

                countryStatus[prev.toString()].relegating.direct = relDirect;
            }

            if (diffPlay > 0) {
                let activeTeams = _.difference(relPlay, botTeams);
                activeTeams = chance.shuffle(activeTeams);
                let saved = activeTeams.slice(0, diffPlay);
                let extraSaved = diffPlay - saved.length;

                relPlay = _.difference(relPlay, saved);
                relPlay.splice(0,extraSaved);

                countryStatus[prev.toString()].relegating.playoff = relPlay;
            }
        }
    }

    function _relProLevel(level, seasonNum, allLeagues, botTeams, minLevel, previousLevelObj) {
        var botsFromAbove = [];
        var levelObj = {
            champion: '',
            promoting: {
                direct: [],
                playoff: [],
            },
            relegating: {
                direct: [],
                playoff: [],
            },
            changed: [],
            leagues: []
        };

        let leagues = _.filter(allLeagues, function(league){
            return parseInt(league.level, 10) === level;
        });

        _.each(leagues, function(league){
            if (minLevel > level) api._relegateTeamsPerLevel(league, seasonNum, levelObj, level, botTeams);
        });

        //check previous level for bots and relegate them further
        // if (previousLevelObj && level < minLevel) {
        //     botsFromAbove = teamsModel.botsInList(previousLevelObj.relegating.direct);
        //     levelObj.relegating.direct = levelObj.relegating.direct.concat(botsFromAbove);
        // }

        return levelObj;
    }

    /**
     * For each league passed, assign the relegating teams for the current season (seasonNum)
     * Bots are automatically relegated
     * Last 3 places direct relegate
     * Next last 3 places go to playoff
     * @param  {object} league   [description]
     * @param  {number} seasonNum   [description]
     * @param  {object} levelObj [description]
     * @param  {number} level    [description]
     * @param  {array} botTeams [description]
     */
    function _relegateTeamsPerLevel(league, seasonNum, levelObj, level, botTeams) { //you need to exclude last level from this
        var season = league.seasons[seasonNum];
        var teams = model.sortTeamsByStanding(season);
        var teamIDs = _.map(teams, function(team){return team.team_id._str});

        _.each(teamIDs, function(teamID, place){
            if (!_.contains(botTeams, teamID)) {
                if (_.contains([13,12,11], place)) {
                    levelObj.relegating.direct.push(teamID);
                }

                if (_.contains([10,9,8], place)) {
                    levelObj.relegating.playoff.push(teamID);
                }

            } else {
                levelObj.relegating.direct.push(teamID);
            }
        });
    }

    /**
     * If level is one, assign champion and return
     * Based on the number of available playoff and direct placed, distribute the promoting opportunities to all teams of this level
     * @param  {[type]} leagues  [description]
     * @param  {[type]} botTeams [description]
     * @return {[type]}          [description]
     */
    function _promoteTeamsPerLevel(countryStatus, level, allLeagues, allBotTeams, seasonNum) {
        var supLevelObject = countryStatus[level-1];
        var currLevelObj = countryStatus[level];
        var leagues = _.filter(allLeagues, function(league){
            return parseInt(league.level, 10) === level;
        });
        var seasons = leagues.map(function(league){return league.seasons[seasonNum];});


        if (level === 1) {
            api._assignChampion(leagues, currLevelObj, seasonNum);
            return;
        }

        //next - do the fancy promotion
        var promotedDirect = api._directPromotion(seasons, supLevelObject.relegating.direct.length, allBotTeams, level);
        var promotedPlayoff = api._playoffPromotion(seasons, supLevelObject.relegating.playoff.length, promotedDirect, allBotTeams, level);

        countryStatus[level].promoting.direct = countryStatus[level].promoting.direct.concat(promotedDirect);
        countryStatus[level].promoting.playoff = countryStatus[level].promoting.playoff.concat(promotedPlayoff);
    }

    /**
     * Take all non-bot teams from 1st place and put them in the promotion array
     * If there are remaining spots, take non-bot teams from 2nd spot and lower
     * @param  {array} seasons          List of current season from the leagues of the current level
     * @param  {number} availablePlaces Number of available places for direct promotion
     * @return {array}                  Array of team ids that are not bots and have directly promoted
     */
    function _directPromotion(seasons, availablePlaces, allBotTeams, level) {
        var promotedDirect = [],
        promoted = 0,
        extraPlace = 2;

        promotedDirect = _.map(seasons, function(season){
            return model.sortTeamsByStanding(season)[0].team_id._str;
        });
        promotedDirect = _.difference(promotedDirect, allBotTeams);

        promotedDirect = model.teamsToStrings(promotedDirect);
        promoted += promotedDirect.length

        while (promoted < availablePlaces && extraPlace <= 14) {
            let diff = availablePlaces - promoted;
            let extra = model.bestOnPlaceExcluding(diff, extraPlace, seasons, allBotTeams);

            extra = model.teamsToStrings(extra);
            promotedDirect = promotedDirect.concat(extra);

            promoted += extra.length;
            extraPlace++;
        }
        return promotedDirect;
    }

    /**
     * Take all non-bot teams and non-direct promoted from 2nd place and put them in the promotion array
     * If there are remaining spots, take non-bot teams from 3nd spot and lower
     * @param  {array} seasons          List of current season from the leagues of the current level
     * @param  {number} availablePlaces Number of available places for direct promotion
     * @return {array}                  Array of team ids that are promoting via playoff
     *
     * THIS FUNCTION IS WRONG
     */
    function _playoffPromotion(seasons, availablePlaces, promotedDirect, allBotTeams, level) {
        var playoffPromoted = [],
        excluded = [],
        promoted = 0,
        extraPlace = 3;

        excluded = promotedDirect.concat(allBotTeams);
        playoffPromoted = _.map(seasons, function(season){
            return model.sortTeamsByStanding(season)[1].team_id._str;
        });

        playoffPromoted = _.difference(playoffPromoted, excluded);
        playoffPromoted = model.teamsToStrings(playoffPromoted);
        promoted += playoffPromoted.length

        while (promoted < availablePlaces && extraPlace <= 14) {
            let diff = availablePlaces - promoted;
            let extra = model.bestOnPlaceExcluding(diff, extraPlace, seasons, excluded);
            extra = model.teamsToStrings(extra);

            playoffPromoted = playoffPromoted.concat(extra);
            promoted += extra.length;
            extraPlace++;
        }

        return playoffPromoted;
    } //the teams that play in playoff are different than the teams that are checked for promotion. WHY?

    /**
     * If the league is a top league, assign the champion
     * @param  {array} leagues       Array of leagues. Will contain just 1 - the top
     * @param  {object} currLevelObj The level object with info to be modified
     * @return {[type]}              [description]
     */
    function _assignChampion(leagues, currLevelObj, seasonNum) {
        var season = leagues[0].seasons[seasonNum];
        var teams = model.sortTeamsByStanding(season);
        var teamIDs = _.map(teams, function(team){return team.team_id._str});
        currLevelObj.champion = teamIDs[0];
    }
    /**
     * Based on a list of playoff objects or cursor, send a playoff scheduled news to all paticipants
     * @param  {cursor/list} playoffList [description]
     * @return {[type]}             [description]
     */
    function _sendPlayoffNews(playoffList) {
        var news = [];
        playoffList.forEach(function (playoff) {
            news.push(newsApi.game.playoffScheduled(playoff.team1_id, {_id: playoff.team2_id, name: playoff.name2}, true));
            news.push(newsApi.game.playoffScheduled(playoff.team2_id, {_id: playoff.team1_id, name: playoff.name1}, true));
        });
        if (news.length> 0) Events.batchInsert(news);
    }

    function _sendPromotionNews(countryStatus, maxLevel) {
        var news = [];
        var teamsID = [];
        var teams = [];

        for (var i=2; i<=maxLevel; i++) {
            let promoted = countryStatus[i.toString()].promoting.direct;
            teamsID = teamsID.concat(promoted);
        }

        teamsID = teamsID.map(function(id){
            return new Mongo.ObjectID(id);
        });

        teams = Teams.find({_id: {$in: teamsID}}, {fields:{_id:1}});
        teams.forEach(function (team) {
            news.push(newsApi.game.teamPromoted(team._id, true));
        });

        if (news.length> 0) Events.batchInsert(news);
    }

    return api;
}

export default seasonUpdates();


//next steps
//for each level, check how many bot teams are in there
//bot teams relagate directly. So if 1 bot, you relagate 2 + 1 bot aka 14, 13 + bot
// for multiple series,