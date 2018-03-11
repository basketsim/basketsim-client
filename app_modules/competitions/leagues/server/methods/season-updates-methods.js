import news from './../../../../news/server/api.js'
import finances from './../../../../finances/server/api.js'

Meteor.methods({
    'competitions:leagues:season-updates-methods:seasonUpdate': seasonUpdate,
    'competitions:leagues:season-updates-methods:unsetLatestSeason': unsetLatestSeason
});

var chance = new Chance();

var countries = ["Greece", "Slovenia", "USA", "Italy", "Latvia", "Poland", "Spain", "Bosnia", "Serbia", "Estonia", "Lithuania", "France", "Turkey", "Croatia", "Philippines",
   "Romania", "Belgium", "Germany", "Israel", "Portugal", "Argentina", "Bulgaria", "Indonesia", "Finland", "FYR Macedonia", "United Kingdom", "Czech Republic",
   "Australia", "Uruguay", "Canada", "Hungary", "Switzerland", "Netherlands", "China", "Russia", "Slovakia", "Cyprus", "Brazil", "Chile", "Sweden", "Albania",
   "Venezuela", "Ukraine", "Montenegro", "Denmark", "Norway", "Ireland", "South Korea", "Malaysia", "Austria", "Malta", "Japan", "New Zealand", "Belarus", "Peru",
   "Thailand", "Mexico", "Colombia", "Hong Kong", "Puerto Rico", "Tunisia", "India", "Georgia", "Egypt"];

countries = ['Romania'];
var statusPerCountry = {};

function seasonUpdate() {
    if (this.userId !== 'wg2H3Bem7BrERkEsZ') return;
    console.log('seasonUpdate started');
    var leagues = [];
    var currSeason = 0;
    var minLevel = 1;
    var bots = [];
    var playoffResults = {};
    var seasonNum = GameInfo.findOne().season;
    _.each(countries, function(country){
        resetStatusPerCountry();
        leagues = Leagues.find({country:country}).fetch();
        playoffResults = getPlayoffResults(country, seasonNum);
        currSeason = leagues[0].currentSeason;
        minLevel = getMinLeagueLevel(leagues, currSeason);
        bots = getBotTeams(leagues, minLevel, currSeason);

        updateLeagues(leagues, currSeason, minLevel, playoffResults);
    });
    console.log('seasonUpdate ended');
}

function unsetLatestSeason() {
    if (this.userId !== 'wg2H3Bem7BrERkEsZ') return;
    console.log('unset started');

    var seasonNum = GameInfo.findOne().season;
    Leagues.update({}, {$unset: {["seasons."+seasonNum]:''}}, {multi:true});
    // Leagues.update({}, {$set: {"currentSeason": seasonNum-1}}, {multi:true});
    Teams.update({}, {$unset:{['competitions.natLeague.seasons.'+seasonNum]:''}}, {multi:true});
    // Teams.update({}, {$set:{'competitions.natLeague.currentSeason' : seasonNum-1 }}, {multi:true});
    Matches.remove({'competition.collection':'Leagues', 'competition.season':seasonNum});
    console.log('unset ended');
    console.log('leagues where s24 exists', Leagues.find({['seasons.'+ seasonNum]:{$exists:true}}).count());
}

function getPlayoffResults(country, seasonNum) {
    var results = {
        winners: [],
        losers: [],
        pairs: []
    };
    var playoffs = Playoffs.find({country:country, season:seasonNum}).fetch();
    _.each(playoffs, function(playoff){
        if (playoff.homescore > playoff.awayscore) {
            results.winners.push(playoff.team1_id._str);
            results.losers.push(playoff.team2_id._str);
            results.pairs.push({winner: {_str: playoff.team1_id._str, name: playoff.name1}, loser: {_str: playoff.team2_id._str, name:playoff.name2}});
        } else if (playoff.homescore < playoff.awayscore) {
            results.winners.push(playoff.team2_id._str);
            results.losers.push(playoff.team1_id._str);
            results.pairs.push({loser: {_str: playoff.team1_id._str, name: playoff.name1}, winner: {_str: playoff.team2_id._str, name:playoff.name2}});
        }
    });

    // console.log('playoff results', results.winners.length, results.losers.length);
    return results;
}

function getMinLeagueLevel(leagues, currSeason) {
    var minLevel = 1;

    _.each(leagues, function(league){
        if (league.level > minLevel && league.seasons[currSeason].teams[0]) {
            minLevel = league.level;
        }
    });

    return minLevel;
}
/**
 * 1. For each level get all relegating and promoting teams
 * 2. Create new league object for next season after subtracting the promoting/relegatig
 * 3. Add promoting/relegating from other levels to next league object
 */
function updateLeagues(leagues, currSeason, minLevel, playoffResults) {
    var activeLeaguesPerLevel = getActivePerLevel(leagues, minLevel);
    var leagueChanges = getLeagueChanges(activeLeaguesPerLevel, currSeason, minLevel, playoffResults);
    var series = [];
    for (var i=1; i<=minLevel; i++) {
        series = activeLeaguesPerLevel[i];
        _.each(series, function(serie){
            assignTrophies(serie);
            assignMoneyPrize(serie);
            createNewSeason(currSeason, i, serie, leagueChanges, playoffResults);
        });
    }
}

function assignTrophies() {
    console.log('trophies not implemented yet');
    //send message - you will receive your trophy in a few days!
}

function assignMoneyPrize(serie) {
    var season = 23;
    var rewardTable = {
        1: [1500, 1200, 900, 750, 600, 500, 450, 400, 200, 200, 200, 200, 200, 200],
        2: [900, 550, 550, 500, 450, 400, 350, 300, 150, 150, 150, 150, 150, 150],
        3: [800, 450, 450, 410, 370, 330, 290, 250, 120, 120, 120, 120, 120, 120],
        4: [700, 350, 350, 320, 290, 260, 230, 200, 100, 100, 100, 100, 100, 100],
        5: [600, 300, 300, 260, 220, 180, 140, 100, 75, 75, 75, 75, 75, 75]
    };
    var reward = 0;

    var teams = _.sortBy(_.sortBy(_.sortBy(serie.seasons[season].teams, 'scored'), 'difference'), 'win').reverse();
    _.each(teams, function(team, place){
        reward = rewardTable[serie.level][place] * 1000;
        Teams.update({_id: team.team_id}, {$inc: {curmoney: reward}});
        finances.spending.update(team.team_id);

        news.game.leagueEnd(team.team_id, serie.name, serie.country, place+1, reward);
    });
}
/**
 * Create new season is called per level, per series, starting with 1.1, 2.1, 2.2 etc
 */
function createNewSeason(currSeason, level, serie, leagueChanges, playoffResults) {
    var testing = false;
    // if (serie.name === '3.9') testing = true;

    var currentTeams = serie.seasons[currSeason].teams;
    var promoting_id_str = [];
    var relegating_id_str = [];
    var promotingTeams = []; //to be replaced by relegating teams from superior leagues
    var relegatingTeams = []; //to be replaced by promoting teams from inferior leagues
    var promoted, relagated;
    var newSeason = {};
    var newTeams = [];

    /*
        Gather all promoting and relegating strings of the whole level
        This seems ok, but how league changes is populated?
    */
    _.each(leagueChanges.promoting[level], function(team){
        promoting_id_str.push(team.team_id._str);
    });
    _.each(leagueChanges.relegating[level], function(team){
        relegating_id_str.push(team.team_id._str);
    });

    if (testing) console.log('promoting and relegating teams', promoting_id_str, relegating_id_str);

    /*
    * Go through all current teams in league and check if their id is in either promoting or relegating
    * If not in any, add it to newTeams - which will be used to create the new season
    */
    _.each(currentTeams, function(team){
        //keep teams that are not promoting and not relegating
        if (testing) console.log('current teams', team.team_id._str, team.name);
        if (_.contains(promoting_id_str, team.team_id._str)) {
            promotingTeams.push(team.team_id._str);
        } else if(_.contains(relegating_id_str, team.team_id._str)) {
            relegatingTeams.push(team.team_id._str);
        } else {
            newTeams.push(team);
        }
    });

    _.each(promotingTeams, function(promotingTeam){
        // if (testing) console.log('promotingTeams', promotingTeam);
        relagated = replaceWithRelagatingTeam(promotingTeam, level, leagueChanges, playoffResults, testing);
        // if (testing) console.log('incoming relagatedTeams', relagated);
        if (relagated) newTeams.push(relagated);
    });
    _.each(relegatingTeams, function(relegatingTeam){
        // if (testing) console.log('relegatingTeams', relegatingTeam);
        promoted = replaceWithPromotingTeam(relegatingTeam, level, leagueChanges, playoffResults, testing);
        // if (testing) console.log('incoming promoted teams', promoted);
        if (promoted) newTeams.push(promoted);
    });

    if (newTeams.length !== 14) {
        console.log('error in ', serie.name, serie.country, newTeams.length);
    }

    addSeason(serie._id, newTeams, currSeason+1);
    updateTeams(newTeams, serie, currSeason+1);
}
/**
 * add New season
 * update current season
 * @param {[type]} id           [description]
 * @param {[type]} teams        [description]
 * @param {[type]} seasonNumber [description]
 */
function addSeason(leagueId, teams, seasonNumber) {
    var league = [];
    var teamObj = {};
    var teamid;
    var setter = {}
    setter.currentSeason = seasonNumber;
    setter['seasons.'+seasonNumber+'.teams'] = [];
    setter['seasons.'+seasonNumber+'.state'] = {
        round: 1,
        matchesPlayed: 0,
        regularEnded: false
    };

    _.each(teams, function(team, place){
        teamid = getCorrectTeamId(team);
        teamObj = teamInLeague(seasonNumber, teamid, team.name, place+1);
        league.push(teamObj);
    });

    setter['seasons.'+seasonNumber+'.teams'] = league;

    Leagues.update({_id: leagueId}, {$set: setter});
}

// function addState() {
//     if (this.userId !== 'wg2H3Bem7BrERkEsZ') return;
//     var setter = {};
//     setter['seasons.'+23+'.state'] = {
//         round: 1,
//         matchesPlayed: 0,
//         regularEnded: false
//     };
//     var leagues = Leagues.find().fetch();
//     _.each(leagues, function(league){
//         Leagues.update({_id: league._id}, {$set: setter});
//     });
// }

function updateTeams(teams, serie, seasonNumber) {
    var teamid = null;
    var setter = {};
    var listOfTeams = [];
    setter['competitions.natLeague.currentSeason'] = seasonNumber;
    setter['competitions.natLeague.seasons.'+seasonNumber] = {
        _id: serie._id,
        name: serie.name,
        level: serie.level,
        series: serie.series
    };

    _.each(teams, function(team, place){
        teamid = getCorrectTeamId(team);
        listOfTeams.push(teamid);
    });

    Teams.update({_id: {$in:listOfTeams}}, {$set:setter}, {multi:true});
}

function getCorrectTeamId(team) {
    var teamid = null;
    if (team._id) {
        teamid = team.team_id;
    } else {
        teamid = new Mongo.ObjectID(team._str);
    };

    return teamid;
}

function teamInLeague(seasonNumber, teamid, name, place) {
    return {
        _id: teamid,
        team_id: teamid,
        name: name,
        season: seasonNumber,
        position: place,
        played: 0,
        win: 0,
        lose: 0,
        scored: 0,
        against: 0,
        difference: 0,
        lastpos: place
    }
}

/**
 * Team from current level promotes and has to be replaced by a relagating one
 */
function replaceWithRelagatingTeam(promotingTeam_id_str, level, leagueChanges, playoffResults, testing) {
    if (testing) console.log('replace with relegating team, league changes relagating teams', leagueChanges.relegating[level-1].length);
    if (!leagueChanges.relegating[level-1].length) return null;
    var pair = '';
    var relegating = null;
    var relegatingid;
    var relegating_id_str = [];
    var availabeForRelagation = [];
    var availablePlayoffLosers = [];
    var availabeForDirectRelagation = [];

    /* Store string ids of all relegating teams */
    _.each(leagueChanges.relegating[level-1], function(team){
        relegating_id_str.push(team.team_id._str);
    });

    /* Filter only the ones that are available to relegate - that have not yet relegated */
    availabeForRelagation = _.difference(relegating_id_str, statusPerCountry.relegated[level-1]);
    availablePlayoffLosers = _.difference(playoffResults.losers, statusPerCountry.relegated[level-1]);
    availabeForDirectRelagation = _.difference(availabeForRelagation, availablePlayoffLosers);

    if (testing) console.log('availabeForRelagation', availabeForRelagation);
    if (testing) console.log('availablePlayoffLosers', availablePlayoffLosers);
    if (testing) console.log('availabeForDirectRelagation', availabeForDirectRelagation);
    /* If the promoting team played playoff, assign its pair as being the losed of playoff */
    if (_.contains(playoffResults.winners, promotingTeam_id_str)) {
        _.each(playoffResults.pairs, function(paired){
            if (paired.winner._str === promotingTeam_id_str) {
                pair = paired.loser;
            }
        });
    } else {
        pair = null;
    }

    /* If pair is assigned, relegate the pair
     * Else get the next available relegation team
    */
    if (pair) {
        relegating = pair;
        statusPerCountry.relegated[level-1].push(pair._str);
    } else {
        relegatingid = availabeForDirectRelagation[0];
        _.each(leagueChanges.relegating[level-1], function(team){
            if (relegatingid === team.team_id._str) {
                relegating = team;
            }
        });
        if (!relegating) return null;
        statusPerCountry.relegated[level-1].push(relegating.team_id._str);
    }

    return relegating;
}

/**
 * Team from current level relagates and has to be replaced by a promoting one
 */
function replaceWithPromotingTeam(relagatingTeam_id_str, level, leagueChanges, playoffResults) {
    if (!leagueChanges.promoting[level+1].length) return null;
    var pair = '';
    var promoting = null;
    var promotingid;
    var promoting_id_str = [];
    var availabeForPromotion = [];
    var availablePlayoffWinners = [];
    var availableForDirectPromotion = [];

    /* Store string ids of all promoting teams */
    _.each(leagueChanges.promoting[level+1], function(team){
        promoting_id_str.push(team.team_id._str);
    });

    /* Filter only the ones that are available to relegate - that have not yet relegated */
    availabeForPromotion = _.difference(promoting_id_str, statusPerCountry.promoted[level+1]);
    availablePlayoffWinners = _.difference(playoffResults.winners, statusPerCountry.promoted[level+1]);
    availableForDirectPromotion = _.difference(availabeForPromotion, availablePlayoffWinners);

    /* If the relegating team played playoff, assign its pair as being the winner of playoff */
    if (_.contains(playoffResults.losers, relagatingTeam_id_str)) {
        _.each(playoffResults.pairs, function(paired){
            if (paired.loser._str === relagatingTeam_id_str) {
                pair = paired.winner;
            }
        });
    } else {
        pair = null;
    }

    /* If pair is assigned, promote the pair
     * Else get the next available promotion team
    */
    if (pair) {
        promoting = pair;
        statusPerCountry.promoted[level+1].push(pair._str);
    } else {
        promotingid = availableForDirectPromotion[0];
        _.each(leagueChanges.promoting[level+1], function(team){
            if (promotingid === team.team_id._str) {
                promoting = team;
            }
        });
        if (!promoting) return null;

        statusPerCountry.promoted[level+1].push(promoting.team_id._str);
    }

    return promoting;

}

// function promoteToSerie() {
//     var migratingTeams = leagueChanges.promoting[level-1] || [];
//     var newTeams = newTeams.concat(migratingTeams);
// }

// function getLeagueChanges(activeLeaguesPerLevel, currSeason, minLevel, playoffResults) {
//     var changes = {
//         promoting: {
//             1: [],
//             2: []
//         },
//         relegating: {
//             1: [],
//             2: []
//         }
//     };

//     for (var i=1; i<=minLevel; i++) {
//         changes.promoting[i] = getPromotingTeamsPerLevel(activeLeaguesPerLevel, currSeason, i, minLevel, playoffResults);
//         changes.relegating[i] = getRelegatingTeamsPerLevel(activeLeaguesPerLevel, currSeason, i, minLevel, playoffResults);
//     }

//     // console.log('league changes', changes);
//     return changes;

// }
/**
 * General Promotion Rules:
 * First of every series promotes directly
 * Second of every series plays playoff
 */
function getPromotingTeamsPerLevel(activeLeaguesPerLevel, currSeason, level, minLevel, playoffResults) {
    if (level === 1) return [];
    var teams = [];
    var promoting = [];
    var series = activeLeaguesPerLevel[level];

    _.each(series, function(group){
        teams = _.sortBy(_.sortBy(_.sortBy(group.seasons[currSeason].teams, 'scored'), 'difference'), 'win').reverse();
        promoting.push(teams[0]);
        if (_.contains(playoffResults.winners, teams[1].team_id._str)) {
            promoting.push(teams[1]);
        }
    });

    return chance.shuffle(promoting);
}
/*These can be customised based on different rules*/
function getRelegatingTeamsPerLevel(activeLeaguesPerLevel, currSeason, level, minLevel, playoffResults) {
    if (level === minLevel) return [];
    var teams = [];
    var relegating = [];
    var series = activeLeaguesPerLevel[level];

    _.each(series, function(group){
        teams = _.sortBy(_.sortBy(_.sortBy(group.seasons[currSeason].teams, 'scored'), 'difference'), 'win')
        /* Relegate first 3 weakest teams */
        for (var j=0; j<3; j++) {
            relegating.push(teams[j]);
        }
        /* Relegate losers of playoff from next 3 weakest teams */
        for (var i=3; i<6; i++) {
            if (_.contains(playoffResults.losers, teams[i].team_id._str)) {
                relegating.push(teams[i]);
            }
        }
    });

    return chance.shuffle(relegating);
}

function getActivePerLevel(leagues, minLevel) {
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

function getBotTeams(leagues, minLevel, season) {
    var teams = [];
    var team_ids = [];
    var tid_str = [];
    var active_ids = [];
    var botTeams = [], botTeams_ids = [];
    for (var i=1; i<minLevel; i++) {
        _.each(leagues, function(league){
            if (league.level === i) {
                teams = league.seasons[season].teams;
                _.each(teams, function(team){
                    team_ids.push(team.team_id);
                });
            }
        });
    }

    var active = UserInfo.find({team_id: {$in: team_ids}}, {fields:{team_id:true}}).fetch();
    _.each(active, function(userinfo){
        active_ids.push(userinfo.team_id._str);
    });
    _.each(team_ids, function(team_id){
        tid_str.push(team_id._str);
    });

    botTeams = _.difference(tid_str, active_ids);
    _.each(botTeams, function(bot){
        botTeams_ids.push(new Mongo.ObjectID(bot));
    });

    return botTeams;
}

function resetStatusPerCountry() {
    statusPerCountry = {
        promoted: {1:[], 2:[], 3:[], 4:[], 5:[], 6:[], 7:[], 8:[]},
        relegated: {1:[], 2:[], 3:[], 4:[], 5:[], 6:[], 7:[], 8:[]}
    };
}

//start with level 1