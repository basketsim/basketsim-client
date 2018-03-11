import leagueModel from './../models/model.js';
import createBotTeam from './../../../../teams/server/actions/create-bot-team.js';
import scheduleMatches from './../schedule-matches.js';
/*
* Insert a season in each series, that started at a specific round
* Create actual bot teams for every position. The bot team needs to have the whole array of facilities and etc
* Get 12 random players from the available free agents and assign them to the bot team. If there are not enough players, create some bad ones.
* Check how new teams are distributed in lower leagues (should be assigned to league until the league is filled)
 */

function createSeries(country) {
    var time = new Date().valueOf();
    console.log('createSeries started for', country);
    var leagues = [],
        currSeason = 1,
        seriesLevel = 1,
        lvlLeagues = [],
        round = 1;

    leagues = Leagues.find({country:country}).fetch();

    currSeason = GameInfo.findOne().season;
    round = getRound(leagues, currSeason);
    seriesLevel = leagueModel.getMinLeagueLevel(leagues, currSeason) + 1;

    lvlLeagues = getLvlLeagues(seriesLevel, leagues, country, currSeason);
    createSeason(lvlLeagues, currSeason, country);

    console.log('createSeries ended for', country, 'in', (new Date().valueOf()-time)/1000, 'seconds');
}

//serbia, 5, 25
function scheduleNewMatches(country, seriesLevel, currSeason) {
    var leagues = Leagues.find({country:country}).fetch();
    var lvlLeagues = getLvlLeagues(seriesLevel, leagues, country, currSeason);

    scheduleMatches.scheduleCustom(lvlLeagues, '2016-07-20', currSeason);
}

function getLvlLeagues(level, leagues, country, currSeason) {
    var lvlLeagues = [],
        expectedLeagues = 0;

    expectedLeagues = Math.pow(3, level-1);

    lvlLeagues = _.filter(leagues, function(league){ return league.level === level});

    if (expectedLeagues === lvlLeagues.length) {
        return lvlLeagues;
    } else {
        lvlLeagues = createLevel(level, country, currSeason);
        lvlLeagues = Leagues.find({country:country, level:level}).fetch();

        return lvlLeagues;
    }
}

function createLevel(level, country, currSeason) {
    var expectedLeagues = Math.pow(3, level-1);
    for (var i=1; i<=expectedLeagues; i++) {
        Leagues.insert({
            name: level+'.'+i,
            country: country,
            level: level,
            active:1,
            seasons: {},
            series: i,
            currentSeason: currSeason,
            stats: {}
        });
    }
}

/**
 * First created an empty season object for all the selected leagues
 */
function createSeason(lvlLeagues, currSeason, country) {
    lvlLeagues.forEach(function (league) {
        Leagues.update({_id: league._id}, {$set:{
            ['seasons.'+currSeason]: leagueModel.emptySeason()
        }});
    });

    createTeams(lvlLeagues, currSeason, country, function(team){
        let leagueTeam = leagueModel.createLeagueTeam(team._id, team.name, currSeason);
        let leagueID = team.competitions.natLeague.seasons[currSeason]._id;
        Leagues.update({_id: leagueID}, {$push:{
            ['seasons.'+currSeason+'.teams']: leagueTeam
        }});
    });
}

function createTeams(lvlLeagues, currSeason, country, callback) {
    var teams = [];
    var countries = butils.general.countries();
    var indexedCountries = {};
    countries.forEach(function (country, i) {
        indexedCountries[country] = i+1;
    });

    lvlLeagues.forEach(function (league) {
        for (var i = 1; i<=14; i++) {
            let name = 'Bot ' + indexedCountries[league.country] +league.level+league.series+i;
            teams.push({
                name: name,
                competitions: {
                    natLeague: {
                        seasons: {
                            [currSeason]: {
                                _id: league._id,
                                name: league.name,
                                level: league.level,
                                series: league.series
                            }
                        }
                    }
                }
            });
        }
    });

    teams.forEach(function (team) {
        createBotTeam.insert(team.name, team.competitions, country, callback);
    });
}

function getRound(leagues, currSeason) {
    var firstLeague = _.find(leagues, function(league){return league.level === 1});
    var round = firstLeague.seasons[currSeason].state.round;
    if (round === 27) round = 1;

    return round;
}

export default createSeries;