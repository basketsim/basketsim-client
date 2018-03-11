import butils from './../../../../utils/common/api.js';
import GameInfo from './../../../../../collections/GameInfo.js';
import _ from 'underscore';
import Leagues from './../../../../../collections/Leagues.js';
import leagueModel from './../models/model.js';
import teamsModel from './../../../../teams/server/models/team-datamodel.js';
import Teams from './../../../../../collections/Teams.js';

/**
 * Reschuffle redistributes the active teams in leagues, so that the competition stays interesting
 * It does not relegate bots
 * @param testCountries
 */
function reshuffleLeagues(testCountries) {
    var countries = butils.general.countries();
    if (testCountries) countries = testCountries;

    const seasonNum = GameInfo.findOne().season;
    const nextSeasonNum = seasonNum + 1;

    _.each(countries, function(country, i){
        let leagues = Leagues.find({country: country}).fetch();
        reschufflePerCountry(leagues, country, nextSeasonNum);
        console.log(i + '/'+ countries.length + ' reschuffled '+ country+ ' done');
    });
}

function storeTeamInfo(leagues, nextSeasonNum) {
    leagues.forEach(function (league) {
        let season = league.seasons[nextSeasonNum];
        // if (league.name === '2.3') console.log('league', season);
        if (season && season.teams) {
            season.teams.forEach(function (team) {
                Teams.update({_id: team.team_id}, {$set:{
                    ['competitions.natLeague.seasons.'+nextSeasonNum] : {
                        _id: league._id,
                        name: league.name,
                        level: league.level,
                        series: league.series
                    },
                    ['competitions.natLeague.currentSeason']: nextSeasonNum
                }}, function(){});
            });
        }
    });
}

function reschufflePerCountry(leagues, country, nextSeasonNum) {
    const maxLevel = leagueModel.getMinLeagueLevel(leagues, nextSeasonNum);
    const botTeams = leagueModel.getBotTeams(leagues, maxLevel, nextSeasonNum);
    const countryActiveTeams = teamsModel.getActiveBy({country: country}, {name: 1, 'competitions.natLeague':1});

    for (let level=2; level <= maxLevel; level++) {
        // reschufflePerLevel(leagues, level, maxLevel, botTeams, nextSeasonNum, countryActiveTeams);
        reschuffleAlternate(leagues, level, maxLevel, botTeams, nextSeasonNum);
    }
}

function reschuffleAlternate(leagues, level, maxLevel, botTeams, nextSeasonNum) {
    const currLevelLeagues = leaguesOfLevel(leagues, level);
    const leagueMostActive = emptySpots(currLevelLeagues, botTeams, nextSeasonNum);
    const leagueLeastActive = leagueMostActive.slice().reverse(); // slice is used for making copy
    // console.log('leagueLeastActive', leagueLeastActive);
    if (!leagueLeastActive[0]) return;
    const levelBots = [];

    leagueLeastActive.forEach(function (leagueInfo) {
        leagueInfo.stayingTeams = getActiveFromLeague(leagueInfo, botTeams, nextSeasonNum);
        levelBots.push(...getBotsFromLeague(leagueInfo, botTeams, nextSeasonNum));
    });

    // console.log('leagueLeastActive length', leagueLeastActive.length);
    for (let i = 0; i< leagueLeastActive.length - 1; i++) {
        let leagueInfo = leagueLeastActive[i];
        if (leagueInfo.stayingTeams.length > 6) break; //if there are more than 6 active teams, leave the league untouched

        let remainingLeagues = leagueLeastActive.slice(i+1, leagueLeastActive.length);
        let totalSpots = remainingLeagues.length * 14;
        let takenSpots = _.reduce(leagueLeastActive, function(sum, linfo){ return sum + linfo.stayingTeams.length; }, 0);
        let freeSpots = totalSpots - takenSpots;

        // console.log('leagueInfo.stayingTeams, freeSpots', leagueInfo.stayingTeams.length, freeSpots);
        if (leagueInfo.stayingTeams > freeSpots) break;
        pushToNextLeagues(leagueInfo, leagueLeastActive, i);
    }

    leagueLeastActive.forEach(function (leagueInfo) {
        while(leagueInfo.stayingTeams.length < 14) {
            leagueInfo.stayingTeams.push(levelBots.shift());
        }
        // console.log(leagueInfo.league.name, leagueInfo.stayingTeams.length);
        // if (leagueInfo.league.level === 3) {
        //     console.log('----'+leagueInfo.league.name+'-----');
        //     console.log(leagueInfo.stayingTeams);
        // }
        //
        storeLeague(leagueInfo, nextSeasonNum);
    });



}

function pushToNextLeagues(leagueInfo, leagueLeastActive, index) {
    var count = 1;
    var nextOpenLeague = leagueLeastActive[index + count];
    // console.log('pushToNextLeagues leagueLeastActive length', leagueLeastActive.length);
    // console.log('----leagueLeastActive----');
    // console.log(leagueLeastActive);

    while (leagueInfo.stayingTeams.length > 0) {
        // console.log('----leagueInfo----');
        // console.log(leagueInfo);

        // console.log('----nextOpenLeague---- undefined ---', index, count);
        // console.log(nextOpenLeague);

        if (nextOpenLeague.stayingTeams.length === 14) {
            count++;
            nextOpenLeague = leagueLeastActive[index + count]; //this can overshoot the array length
        }

        if (!nextOpenLeague) break;
        nextOpenLeague.stayingTeams.push(leagueInfo.stayingTeams.shift());
    }
}

function reschufflePerLevel(leagues, level, maxLevel, botTeams, nextSeasonNum) {
    const currLevelLeagues = leaguesOfLevel(leagues, level);
    const leagueMostActive = emptySpots(currLevelLeagues, botTeams, nextSeasonNum);
    const leagueLeastActive = leagueMostActive.slice().reverse(); // slice is used for making copy

    if (!leagueLeastActive[0]) return;

    var newLeagues = [];

    while(leagueLeastActive.length > 1) {
        var leastActive = leagueLeastActive[0];
        if (leastActive.activeTeams >= 7) break;

        var mostActive = leagueLeastActive[leagueLeastActive.length - 1];

        leastActive.enterTeams = [];
        leastActive.exitTeams = getActiveFromLeague(leastActive, botTeams, nextSeasonNum); //active teams need to leave
        leastActive.stayingTeams = getBotsFromLeague(leastActive, botTeams, nextSeasonNum); //bots need to stay

        mostActive.enterTeams = [];
        mostActive.exitTeams = getBotsFromLeague(mostActive, botTeams, nextSeasonNum); //bots need to leave
        mostActive.stayingTeams = getActiveFromLeague(mostActive, botTeams, nextSeasonNum); //active teams need to stay

        while ( leastActive.exitTeams.length!==0 ) {
            /* Save mostActive changes in a new array if all teams have been switched */
            if (leagueLeastActive.length === 1) break;

            mostActive.enterTeams.push(leastActive.exitTeams.shift());
            leastActive.enterTeams.push(mostActive.exitTeams.shift());

            if (mostActive.exitTeams.length === 0) {
                newLeagues.push(mostActive);
                leagueLeastActive.pop();
                mostActive = leagueLeastActive[leagueLeastActive.length - 1];


                mostActive.enterTeams = [];
                mostActive.exitTeams = getBotsFromLeague(mostActive, botTeams, nextSeasonNum); //bots need to leave
                mostActive.stayingTeams = getActiveFromLeague(mostActive, botTeams, nextSeasonNum); //active teams need to stay
            }
        }

        newLeagues.push(leastActive);
        leagueLeastActive.shift();
    }

    newLeagues.forEach(function (leagueInfo) {
        leagueInfo.stayingTeams = leagueInfo.stayingTeams.concat(leagueInfo.enterTeams).concat(leagueInfo.exitTeams);

        storeTeamInfo(leagueInfo, leagueInfo.enterTeams.concat(leagueInfo.exitTeams), nextSeasonNum);
        storeLeague(leagueInfo, nextSeasonNum);
        if (leagueInfo.league.name, leagueInfo.stayingTeams.length !== 14) console.log('NOT 14 TEAMS', leagueInfo.league.name, leagueInfo.league._id)
    });

}

// function storeTeamInfo(leagueInfo, changedTeams, nextSeasonNum) {
//     const teamSesInfo = {
//         _id: leagueInfo.league._id,
//         name: leagueInfo.league.name,
//         level: leagueInfo.league.level,
//         series: leagueInfo.league.series
//     };

//     changedTeams.forEach(function (team) {
//         Teams.update({_id: team._id}, {$set: {
//             ['competitions.natLeague.seasons.' + nextSeasonNum] : teamSesInfo
//         }});
//     });
// }

function storeLeague(leagueInfo, nextSeasonNum) {
    Leagues.update({_id: leagueInfo.league._id}, {$set: {
        ['seasons.'+nextSeasonNum+'.teams']: leagueInfo.stayingTeams
    }});
}

function getBotsFromLeague(leagueInfo, botTeams, nextSeasonNum) {
    var teams = leagueInfo.league.seasons[nextSeasonNum].teams;
    teams = _.sortBy(teams, function(team){ return team._id._str; });

    var bots = [];
    teams.forEach(function (team) {
        if(_.contains(botTeams, team._id._str)) {
            bots.push(team);
        }
    });

    return bots;
}

function getActiveFromLeague(leagueInfo, botTeams, nextSeasonNum) {
    var teams = leagueInfo.league.seasons[nextSeasonNum].teams;
    teams = _.sortBy(teams, function(team){ return team._id._str; });

    var active = [];
    teams.forEach(function (team) {
        if(!_.contains(botTeams, team._id._str)) {
            active.push(team);
        }
    });

    return active;
}

/**
 * Pair each league with the number of available places (bot teams) that it contains
 * Also, if emptySpots === 14 || 0 -> remove them from the list
 * @return {Array}            List of leagues/places object pairs, with highest
 */
function emptySpots(leagues, botTeams, currSeason) {
    var emptySpots = [];

    leagues.forEach(function (league) {
        let teamIDs = leagueModel.teamsFromLeagues([league], currSeason).teamsIDStr;
        let botsLength = 14 - _.difference(teamIDs, botTeams).length;
        let freeSpots = 0;

        freeSpots = botsLength;
        let activeTeams = 14 - freeSpots;
        emptySpots.push({league: league, freeSpots: freeSpots, series:league.series, activeTeams: activeTeams});
    });

    emptySpots = _.sortBy(_.sortBy(emptySpots, 'series'), 'freeSpots');

    return emptySpots;
}

function leaguesOfLevel(leagues, level) {
    return _.filter(leagues, function(league){return league.level === level; });
}



export default reshuffleLeagues;