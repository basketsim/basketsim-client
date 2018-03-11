import _ from 'underscore';
import Chance from 'chance';
import butils from './../../../../utils/common/api.js';
import GameInfo from './../../../../../collections/GameInfo.js';
import Leagues from './../../../../../collections/Leagues.js';
import leagueModel from './../models/model.js';
import teamsModel from './../../../../teams/server/models/team-datamodel.js';
import Teams from './../../../../../collections/Teams.js';
import news from './../../../../news/server/game.js';

function leagueWildcardsN(testCountries) {
    var countries = butils.general.countries();
    if (testCountries) countries = testCountries;

    const seasonNum = GameInfo.findOne().season;
    const nextSeasonNum = seasonNum + 1;

    _.each(countries, function(country, i){
        switchPerCountry(country, nextSeasonNum);
        console.log(i, '/', countries.length, 'wildcards in ', country, 'done');
    });
}

/**
 * [impure] Gets leagues of country, max level, botTeams and activeTeams.
 * Sends this info to a switchPerLevel function
 * @param  {[type]} country       [description]
 * @param  {[type]} nextSeasonNum [description]
 * @return {[type]}               [description]
 */
function switchPerCountry(country, nextSeasonNum) {
    const leagues = Leagues.find({country: country}).fetch();
    const maxLevel = leagueModel.getMinLeagueLevel(leagues, nextSeasonNum);
    const botTeams = leagueModel.getBotTeams(leagues, maxLevel, nextSeasonNum);
    const countryActiveTeams = teamsModel.getActiveBy({country: country}, {name: 1, 'competitions.natLeague':1});
    // console.log('countryActiveTeams', countryActiveTeams);
    // console.log('active teams in ', country, countryActiveTeams.length);

    for (let level=1; level < maxLevel; level++) {
        switchPerLevel(leagues, level, maxLevel, botTeams, nextSeasonNum, countryActiveTeams);
    }
}

/**
 * This is where the switch should be done
 * @param  {[type]} leagues            [description]
 * @param  {[type]} level              [description]
 * @param  {[type]} botTeams           [description]
 * @param  {[type]} nextSeasonNum      [description]
 * @param  {[type]} countryActiveTeams [description]
 * @return {[type]}                    [description]
 */
function switchPerLevel(leagues, level, maxLevel, botTeams, nextSeasonNum, countryActiveTeams) {
    const currLevelLeagues = leaguesOfLevel(leagues, level);
    const inferiorLeagues = leaguesOfLevel(leagues, level+1);

    const levelTeamIDs = leagueModel.teamsFromLeagues(currLevelLeagues, nextSeasonNum).teamsIDStr;
    const inferiorTeamsIDs = leagueModel.teamsFromLeagues(inferiorLeagues, nextSeasonNum).teamsIDStr;

    const botsToBeDemoted = botsInList(levelTeamIDs, botTeams);
    const inferiorActive = activeInList(inferiorTeamsIDs, botTeams);

    const activeWildcards = getActiveWildcards(inferiorActive, countryActiveTeams, level, maxLevel, nextSeasonNum, botsToBeDemoted.length);

    switchInLeagues(currLevelLeagues, activeWildcards, botsToBeDemoted, nextSeasonNum);
}

/**
 * Goes through each league. If there are activeWildcards, replace a bot from the league with one of the wildcards
 * Replacing does the following:
 * - inserts the wildcard in the upper league.
 * - inserts the bot in the lower league.
 */
function switchInLeagues(leagues, activeWildcards, botsToBeDemoted, nextSeasonNum) {
    const sortedBySerie = _.sortBy(leagues, function(league){ return league.series; });
    // console.log('switchInLeagues: botsToBeDemoted', botsToBeDemoted);
    // console.log('sortedBySerie', sortedBySerie);
    for (let league of leagues) {
        const season = league.seasons[nextSeasonNum];
        var newTeams = [];
        var teamsChanged = false;

        for (let team of season.teams) {
            // if (team.team_id._str === '55cf11431cc5f84ae63e98a9') console.log('hotshots team is being processed');
            // if (team.team_id._str === '55cf11431cc5f84ae63e98a9') console.log(!_.contains(botsToBeDemoted, team.team_id._str), !activeWildcards[0]);
            if (!_.contains(botsToBeDemoted, team.team_id._str) || !activeWildcards[0]) {
                newTeams.push(team);
            } else {
                switchInLowerLeague(team, league, activeWildcards[0], nextSeasonNum);
                switchTeamInfo(team, league, activeWildcards[0], nextSeasonNum);

                team._id = activeWildcards[0]._id;
                team.team_id = activeWildcards[0]._id;
                team.name = activeWildcards[0].name;
                newTeams.push(team);

                activeWildcards.shift();
            }
        }

        Leagues.update({_id: league._id}, {$set: {
            ['seasons.'+nextSeasonNum+'.teams']: newTeams
        }});
    }
}

function switchInLowerLeague(relegatedTeam, league, wildCardTeam, nextSeasonNum) {
    console.log('enters here');
    if (!wildCardTeam.competitions.natLeague.seasons[nextSeasonNum]) {
        console.log('wildCardTeam with no league. INVESTIGATE if this is not expected', wildCardTeam.name, wildCardTeam._id._str);
        return; //if it's one of the wildcarded teams
    }
    const lowerLeagueID = wildCardTeam.competitions.natLeague.seasons[nextSeasonNum]._id;
    const lowerLeague = Leagues.findOne({_id: lowerLeagueID});
    const season = lowerLeague.seasons[nextSeasonNum];

    var newTeams = [];

    season.teams.forEach(function (team) {
        if (team.team_id._str === wildCardTeam._id._str) {
            team._id = relegatedTeam._id;
            team.team_id = relegatedTeam.team_id;
            team.name = relegatedTeam.name;

        }

        newTeams.push(team);
    });

    console.log('leagues newTeams', newTeams);
    Leagues.update({_id: lowerLeagueID}, {$set: {
        ['seasons.'+nextSeasonNum+'.teams']: newTeams
    }});
}

function switchTeamInfo(botTeam, botTeamLeague, wildCardTeam, nextSeasonNum) {
    const bts = wildCardTeam.competitions.natLeague.seasons[nextSeasonNum];

    const wildCardTeamSesonInfo = {
        _id: botTeamLeague._id,
        name: botTeamLeague.name,
        level: botTeamLeague.level,
        series: botTeamLeague.series
    };

    const botTeamSesonInfo = wildCardTeam.competitions.natLeague.seasons[nextSeasonNum];

    Teams.update({_id: botTeam._id}, {$set: {
        ['competitions.natLeague.seasons.' + nextSeasonNum] : botTeamSesonInfo
    }});

    Teams.update({_id: wildCardTeam._id}, {$set: {
        ['competitions.natLeague.seasons.' + nextSeasonNum] : wildCardTeamSesonInfo
    }}, function(){
        //send news to the team about the wildcard
        news.wildcardReceived(wildCardTeam._id);
    });
}

/**
 * Take the inferior active teams and sort them, in random manner and limited to the number of open spots, by:
 *   If the nextSeason is null, the team gets prio
 *   Teams with the highest prior season, get promoted first
 *
 *   If there are no open spots, return empty
 */
function getActiveWildcards(inferiorActiveIDs, countryActiveTeams, level, maxLevel, nextSeasonNum, openSpots) {
    // if (openSpots === 0) return [];
    const teams = _.filter(countryActiveTeams, function(team){ return _.contains(inferiorActiveIDs, team._id._str); });
    const groupedTeams = groupTeamsByPriority(teams, nextSeasonNum, level);

    const wildCardedTeams = [];

    assignWildCards(wildCardedTeams, groupedTeams, openSpots, level);
    return wildCardedTeams;
}

/**
 * Recursively goes through groupedTeams, which contains eligible teams for wildcard promotion
 * If there are openSpots remaining,
 * @param  {[type]} wildCardedTeams [description]
 * @param  {[type]} groupedTeams    [description]
 * @param  {[type]} openSpots       [description]
 * @return {[type]}                 [description]
 */
function assignWildCards(wildCardedTeams, groupedTeams, openSpots, level) {
    const chance = new Chance();

    if (openSpots === 0) {
        return;
    }

    if (groupedTeams.unnasigned.length > 0) {
        const unnasignedTeams = chance.pickset(groupedTeams.unnasignedTeams, openSpots);
        groupedTeams.unnasignedTeams.splice(0, unnasignedTeams.length); //splice is good because you eiter reach openSpots = 0 or you splice it all

        wildCardedTeams.push(...wildCardedTeams.concat(unnasignedTeams));
        openSpots = openSpots - unnasignedTeams.length;

    } else if(groupedTeams.prevSesHigher.length > 0) {
        const higherTeams = chance.pickset(groupedTeams.prevSesHigher, openSpots);
        groupedTeams.prevSesHigher.splice(0, higherTeams.length);

        wildCardedTeams.push(...wildCardedTeams.concat(higherTeams));
        openSpots = openSpots - higherTeams.length;

    } else if (groupedTeams.prevSesSame.length > 0) {
        const sameLevTeams = chance.pickset(groupedTeams.prevSesSame, openSpots);
        groupedTeams.prevSesSame.splice(0, sameLevTeams.length);

        wildCardedTeams.push(...wildCardedTeams.concat(sameLevTeams));
        openSpots = openSpots - sameLevTeams.length;

    } else if (groupedTeams.prevSesLower.length > 0) {
        const lowerTeams = chance.pickset(groupedTeams.prevSesLower, openSpots);
        groupedTeams.prevSesLower.splice(0, lowerTeams.length);

        wildCardedTeams.push(...wildCardedTeams.concat(lowerTeams));
        openSpots = openSpots - lowerTeams.length;

    } else {
        return;
    }

    assignWildCards(wildCardedTeams, groupedTeams, openSpots, level);
}

function groupTeamsByPriority(teams, nextSeasonNum, level) {
    const groupedTeams = {
        unnasigned: [],
        prevSesHigher: [],
        prevSesSame: [],
        prevSesLower: []
    };

    teams.forEach(function (team) {
        if (!team.competitions.natLeague.seasons[nextSeasonNum]) {
            // groupedTeams.unnasigned.push(team); //not necessary
        } else {
            let prevSeson = team.competitions.natLeague.seasons[nextSeasonNum-1];
            let prevLevel = 0;
            if (prevSeson) prevLevel = prevSeson.level;

            if (!prevLevel || level < prevLevel) groupedTeams.prevSesLower.push(team);
            if (level === prevLevel) groupedTeams.prevSesSame.push(team);
            if (level > prevLevel) groupedTeams.prevSesHigher.push(team);
        }
    });

    // console.log('groupedTeams unnasigned', groupedTeams.unnasigned);

    return groupedTeams;
}

function leaguesOfLevel(leagues, level) {
    return _.filter(leagues, function(league){return league.level === level; });
}

function botsInList(teamIDs, botIDs) {
    return _.intersection(teamIDs, botIDs);
}

function activeInList(teamIDs, botIDs) {
    return _.difference(teamIDs, botIDs);
}

export default leagueWildcardsN;