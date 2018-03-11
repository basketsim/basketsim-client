import seasonUpdates from './season-updates.js';
import model from './models/model.js';
import teamModel from './../../../teams/server/model.js';
import teamDataModel from './../../../teams/server/models/team-datamodel.js';
import playoffModel from './models/playoff-model.js';
import Chance from 'chance';
import {Mongo} from 'meteor/mongo';
import _ from 'underscore';

function newSeason() {
    var api = {insertMulti, create, insert, validate, scheduleMatches, getTeams, _shuffleCountryStatus, _findPlayoffPair, _botCleanup, _transferBots};
    var chance = new Chance();

    function insertMulti(testCountries) {
        console.log(testCountries);
        console.log('insertMulti started');
        var countries = butils.general.countries();
        if (testCountries) countries = testCountries;

        var seasonNum = GameInfo.findOne().season;
        var nextSeasonNum = seasonNum + 1;
        _.each(countries, function(country, i){
            let leagues = Leagues.find({country: country}).fetch();
            let maxLevel = model.getMinLeagueLevel(leagues, seasonNum);
            let ct = seasonUpdates.getCountryStatus(leagues, seasonNum);
            let playoffResults = playoffModel.getResults(country, seasonNum);
            let botTeams = model.getBotTeams(leagues, maxLevel, seasonNum);

            api._shuffleCountryStatus(ct, maxLevel);
            leagues.forEach(function (league) {
                let season = api.create(league, maxLevel, ct, playoffResults, botTeams, seasonNum);
                Leagues.update({_id: league._id}, {$set: {
                    ['seasons.'+ nextSeasonNum]: season,
                    currentSeason: nextSeasonNum
                }});
            });
            console.log(`insertMulti progress ${i+1}/${countries.length}`);
        });
        console.log('insertMulti ended');
    }

    /** Look for the leagues with less than 8 teams and try to distribute them in other leagues of the same level */
    function reshuffleLevel(testCountries) {

    }

    function validate(testCountries) {
        console.log('validate started');
        var countries = butils.general.countries();
        if (testCountries) countries = testCountries;

        var seasonNum = GameInfo.findOne().season;
        var nextSeasonNum = seasonNum + 1;

        _.each(countries, function(country, i){
            let leagues = Leagues.find({country: country}).fetch();
            leagues = _.sortBy(leagues, 'level');
            leagues.reverse();

            let maxLevel = model.getMinLeagueLevel(leagues, seasonNum);
            let ct = seasonUpdates.getCountryStatus(leagues, seasonNum);
            let playoffResults = playoffModel.getResults(country, seasonNum);
            let botTeams = model.getBotTeams(leagues, maxLevel, seasonNum);

            api._shuffleCountryStatus(ct, maxLevel);
            leagues.forEach(function (league) {
                let season = league.seasons[nextSeasonNum];
                if (season && season.teams.length !== 14) {
                    console.log(`validate there are not 14 teams here: ${country} ${league.name} ${league._id}`);
                    let teamIDs = season.teams.map(function(team){return team.team_id._str; });
                    let uniqueIDs = _.uniq(teamIDs);
                    if (uniqueIDs.length !== 14) console.log(`validate there are not 14 unique teams here: ${country} ${league.name} ${league._id}`);
                }
            });
            console.log(`validate progress ${i+1}/${countries.length}`);
        });

        validateTeams(nextSeasonNum);
        // validateTeamsExtra(nextSeasonNum);
        console.log('validate ended');
    }

    function validateTeams(nextSeasonNum) {
        console.log('validateTeams started');
        var teams = teamDataModel.getActive({'competitions.natLeague':1});
        teams.forEach(function (team) {
            if (!team.competitions.natLeague.seasons[nextSeasonNum]) {
                console.log('team has no season', team._id._str, 'last season: ', team.competitions.natLeague.currentSeason);
            }
        });
        console.log('validateTeams ended');
    }

    function validateTeamsExtra(nextSeasonNum) {
        console.log('validateTeamsExtra started');
        var teams = teamDataModel.getActive({'competitions.natLeague':1});
        var leagues = Leagues.find({}, {fields: {['seasons.'+nextSeasonNum]: 1}});
        var mergedLeagueTeams = [];
        var teamsInLeagues = [];

        leagues.forEach(function (league) {
            if (league.seasons[nextSeasonNum]) {
                league.seasons[nextSeasonNum].teams.forEach(function (team) {
                    mergedLeagueTeams.push({team_id: team.team_id._str, league_id: league._id._str});
                });
            }
        });

        teamsInLeagues = mergedLeagueTeams.map(function(team){return team.team_id._str});

        console.log('teams in leagues', teamsInLeagues.length);
        console.log('uniq teams in l:', _.uniq(teamsInLeagues).length);

        teams.forEach(function (team) {
            mergedLeagueTeams.forEach(function (til) {
                if (team._id._str === til.team_id._str) {
                    if (team.competitions.natLeague.seasons[nextSeasonNum]._id._str !== til.league_id._str) console.log('Team league discrepancy', team._id._str);
                }
            });
        });

    }

    /**
     * Go through each team and see if the team stays, promotes or relegates
     * Get country status and for each team check if it is in any arrays.
     * If it is in the playoff array, get result. If it is in the relegation/promotion arrays, act accordingly
     * @return {[type]} [description]
     */
    function create(league, maxLevel, countryStatus, playoffResults, botTeams, seasonNum) {
        if (!league.seasons[seasonNum]) return;
        var dbteams = [];
        var season = {teams:[], state:{}};
        var newTeams = api.getTeams(league, maxLevel, countryStatus, playoffResults, botTeams, seasonNum);
        newTeams = newTeams.map(function(str){return new Mongo.ObjectID(str)});
        dbteams = Teams.find({_id: {$in: newTeams}}, {fields:{name:1}});

        dbteams.forEach(function (team) {
            season.teams.push(model.createLeagueTeam(team._id, team.name, seasonNum+1));
        });

        season.state = {
            round: 1,
            matchesPlayed: 0,
            regularEnded: false,
            roundsd: false //round scheduled
        };

        return season;
    }

    /**
     * THIS IS BROKEN
     * @param  {object} league         Original League object
     * @param  {[type]} maxLevel       [description]
     * @param  {[type]} countryStatus  [description]
     * @param  {[type]} playoffResults Playoff results of the whole country
     * @param  {[type]} botTeams       [description]
     * @param  {[type]} seasonNum      [description]
     * @return {[type]}                [description]
     */
    function getTeams(league, maxLevel, countryStatus, playoffResults, botTeams, seasonNum) {
        // console.log('getTeams, playoffResults', playoffResults.promoting);
        var teams = league.seasons[seasonNum].teams;
        var level = league.level;
        var newTeams = []; // remaining + playoff pair + promoting/relegating, based on the inverse from this league
        var i = 0;
        // if (league.series === 1 && league.level === 2) console.log('2.1 Italy selected. teams are:', teams);
        teams.forEach(function (team) {
            let str = team.team_id._str;
            if (str==='216714fdbd7dbc51b5ed8fd1' || str === "197225625a397130599e4593") {
                console.log(str);
                // debugger;
            }
            //If team is in the direct promoting teams
            if (_.contains(countryStatus[level].promoting.direct, str)) {
                if (str==='216714fdbd7dbc51b5ed8fd1' || str === "197225625a397130599e4593") {
                    console.log(str);
                    // debugger;
                }
                let diff = _.difference(countryStatus[level-1].relegating.direct, countryStatus[level-1].changed);
                newTeams.push(diff[0]);
                countryStatus[level-1].changed.push(diff[0]);
            } else if (_.contains(countryStatus[level].relegating.direct, str)) {
                if (str==='216714fdbd7dbc51b5ed8fd1' || str === "197225625a397130599e4593") {
                    console.log(str);
                    // debugger;
                }
                let diff = _.difference(countryStatus[level+1].promoting.direct, countryStatus[level+1].changed);
                //If there are any promoting teams, do promote them
                if (diff[0]) {
                    newTeams.push(diff[0]);
                    countryStatus[level+1].changed.push(diff[0]);
                //Else keep the relegating one in place
                } else {
                    newTeams.push(str);
                }

            /** Get this from the playoff collection instead of recomputing it */
            } else if (_.contains(playoffResults.promoting, str)) { // look through winners + losers of the playoff. How do you know if the team is fighting for promotion or for relegation?
                if (str==='216714fdbd7dbc51b5ed8fd1' || str === "197225625a397130599e4593") {
                    console.log(str);
                    // debugger;
                }
                if (_.contains(playoffResults.winners, str)) {
                    //if played promotion playoff and won, push pair loser
                    let pair = api._findPlayoffPair(str, playoffResults);
                    if (pair === "216714fdbd7dbc51b5ed8fd1") {
                        // debugger;
                    }
                    newTeams.push(pair);
                } else {
                    //if played promotion playoff and lost, push it
                    newTeams.push(str);
                }
            } else if (_.contains(playoffResults.relegating, str)) { // look through winners + losers of the playoff
                // keep same or push winner
                if (str==='216714fdbd7dbc51b5ed8fd1' || str === "197225625a397130599e4593") {
                    console.log(str);
                    // debugger;
                }
                if (_.contains(playoffResults.losers, str)) {
                    //if played relegation playoff and lost, push pair loser
                    let pair = api._findPlayoffPair(str, playoffResults);
                    if (pair==='216714fdbd7dbc51b5ed8fd1' || pair === "197225625a397130599e4593") {
                        console.log(pair);
                        // debugger;
                    }
                    newTeams.push(pair);
                } else {
                    //if played relegation playoff and won, push it
                    if (str==='55cf113f1cc5f84ae63e5624') console.log('mising team is pushed', str);
                    newTeams.push(str);
                }
            } else {
                // keep same team
                newTeams.push(str);
            }
        });
        return newTeams;
    }

    function insert() {

    }

    function scheduleMatches() {

    }

    /**
     * Remove lower leagues, if all of them are full of bots
     * Remove bot teams from those leagues
     * Update the players belonging to those teams to reflect having no team
     * @return {[type]}         [description]
     */
    function _botCleanup(league, leagues, seasonNum) {
        var lvl, lowerLeagues, lowerLeaguesIDs, teamIDs = [], bots;

        lvl = league.level;
        lowerLeagues = _.filter(leagues, function(lg){
            return lg.level > lvl;
        });

        lowerLeaguesIDs = lowerLeagues.map(function(lg){
            return lg._id;
        });

        if (!lowerLeagues[0]) {
            console.log(`validate there are not 14 teams here and no leagues below: ${league.name} ${league._id}`);
            return;
        }

        lowerLeagues.forEach(function (lg) {
            if (lg.seasons[seasonNum] && lg.seasons[seasonNum].teams) {
                lg.seasons[seasonNum].teams.forEach(function (team) {
                    teamIDs.push(team.team_id);
                });
            }
        });

        bots = teamModel.botsInList(teamIDs);

        if (teamIDs.length === bots.length) {
            //remove all lower leagues, teams, release players and fill league with bot teams
            api._transferBots(league, seasonNum, teamIDs);
            Leagues.update({_id: {$in: lowerLeaguesIDs}}, {$set:{
                ['seasons.'+seasonNum] : null
            }}, {multi:true});
            Teams.update({_id: {$in: teamIDs}}, {$set:{
                ['competitions.natLeague.seasons.'+seasonNum]: null,
                ['competitions.natLeague.currentSeason']: null
            }}, {multi:true});
            Players.update({team_id: {$in: teamIDs}}, {$set:{
                team_id: null
            }});

        } else {
            console.log(`validate there are not 14 teams here and not all below are bots: ${league.name} ${league._id}`);
        }
    }

    function _transferBots(league, seasonNum, teamIDs) {
        var botsNeeded = 14 - league.seasons[seasonNum].teams.length;
        var currentTeams = league.seasons[seasonNum].teams;
        for (var i=0; i<botsNeeded; i++) {
            let newTeamID = teamIDs.shift();
            let team = Teams.findOne({_id: newTeamID}, {fields: {name:1}});
            currentTeams.push(model.createLeagueTeam(team._id, team.name, seasonNum));

            Teams.update({_id: newTeamID}, {$set:{
                ['competitions.natLeague.seasons.'+seasonNum] : {
                    _id: league._id,
                    name: league.name,
                    level: league.level,
                    series: league.series
                },
                ['competitions.natLeague.currentSeason']: seasonNum
            }}, function(){});
        }
        Leagues.update({_id: league._id}, {$set: {
            ['seasons.'+seasonNum+'.teams']: currentTeams
        }});
    }

    function _shuffleCountryStatus(countryStatus, maxLevel) {
        for (var i=1; i<=maxLevel; i++) {
            countryStatus[i].promoting.direct = chance.shuffle(countryStatus[i].promoting.direct);
            countryStatus[i].relegating.direct = chance.shuffle(countryStatus[i].relegating.direct);
        }
    }

    function _findPlayoffPair(str, playoffResults) {
        var pair = '';
        _.each(playoffResults.pairs, function(paired){
            if (paired.winner._str === str) {
                pair = paired.loser._str;
            } else if(paired.loser._str === str) {
                pair = paired.winner._str;
            }
        });
        if (pair === '') {
            console.log('NO PAIR FOUND', str);
            throw new Meteor.error('_findPlayoffPair:no-pair-found', 'No pair found');
        }
        return pair;
    }

    return api;
}

export default newSeason();