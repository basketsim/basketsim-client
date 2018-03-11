import playersMod from './../../app_modules/players/server/api';
import markets from './../../app_modules/markets/server/api.js'

// Accounts.onCreateUser(function(options, user) {
//     insertUserInfo(options);
//     var userinfo = UserInfo.findOne({username:options.username});
//     console.log('accounts on create after user info', options.username, userinfo);

//     if (!userinfo.team_id) throw new Meteor.Error("no-team-assigned", "No available team has been found in the selected country. Please try a different country or send an email to basketsim@basketsim.com to report the issue. Thanks!");

//     markets.marketActivity.insert(userinfo._id, userinfo.team_id);
//     user.userInfo_id = userinfo._id;
//     // We still want the default hook's 'profile' behavior.
//     if (options.profile) {
//         user.profile = options.profile;
//     }

//     return user;
// });

function insertUserInfo(options) {
    var userinfo = {
        username: options.username,
        email: options.email,
        team_id: assignTeam(options),
        signed: new Date().valueOf(),
        lastlog: new Date().valueOf(),
        lang: 'en',
        originCountry: options.country,
        supporter_days: 15,
        national_team: null,
    };
    console.log('insert user info', userinfo);
    UserInfo.insert(userinfo);
}

function assignTeam(options) {
    var team = createTeam(options);
    if (!team) return null;
    return team._id;
}

/**
 * consider moving this in a teams package
 * 1. find available team in the specified country
 * 2. if the country is not defined, return error (for now, next is to create a rest of the world category in which these small countries act)
 * 3. generate players
 */
function createTeam(options) {
    var team = findTeam(options.profile.country);
    if (!team) return null;
    resetTeam(options, team._id);
    resetArena(options, team._id);
    resetMedicalCenter(options, team._id);
    releasePlayers(team._id);
    createNewPlayers(options.profile.country, team._id);
    return team;
}

function resetTeam(options, team_id) {
    Teams.update({_id:team_id}, {$set:{
        name: options.username + "'s team",
        short_name: options.username + "'s team",
        arena_name: options.username + "'s arena",
        city: null,
        curmoney: money(), //check how much money do active teams have
        tempmoney: money(),
        country: options.profile.country,
        logo: null,
        shirt: 'orange',
        youthcamp: 0,
        campinvest: 0,
        schoolinvest: 0,
        draft: 0,
        canPullYouth: true
    }});
}

function resetArena(options, team_id) {
    Arenas.update({team_id: team_id}, {$set:{
          arenaname: options.username + "'s arena",
          court_side: 1500,
          court_end: 1000,
          upper_level: 0,
          vip: 0,
          in_use: 0,
          upgrade_date: null,
          fans: 250,
          cheer_name: '',
          cheer_logo: '',
          cheer_week: 0,
          week_ideal: 0,
          cheer_season: 0,
          season_ideal: 0
    }});
}

function resetMedicalCenter(options, team_id) {
    MedicalCenter.update({team_id: team_id}, {$set:{
        current_level: 0,
        next_update: null
    }})
}

function releasePlayers(team_id) {
    var players = Players.find({team_id: team_id}).fetch();
    _.each(players, function(player){
        Players.update({team_id: team_id}, {$set:{team_id: null}});
    });
}

function createNewPlayers(country, team_id) {
    var positions = ['PG','PG','SG','SG','SF','SF','PF','PF','C','C'];
    var players = [];
    positions.push(positions[Math.round(Math.random()*10)]);
    positions.push(positions[Math.round(Math.random()*10)]);
    _.each(positions, function(pos){
        Players.insert(playersMod.senior.createSenior(country, team_id, pos));
    });
}


/**
 * Two conditions have to be met
 * 1. is in lowest active! league of the country
 * 2. has no owner
 * 3. maybe try to find the highest placed team in the league
 */
function findTeam(country) {
    var selectedLeagues = [];
    var leagues = Leagues.find({country:country}).fetch();
    if (!leagues[0]) return null;

    var currSeason = GameInfo.findOne().season;
    var minLevel = getMinLeagueLevel(leagues, currSeason);
    console.log('min level is', minLevel);
    var lowLevelTeams = getLowLevelTeams(leagues, minLevel, currSeason);
    var botTeam = getBotTeam(lowLevelTeams);

    if (!botTeam) return null;
    var team = Teams.findOne({_id: botTeam.team_id});

    return team;
}

function getMinLeagueLevel(leagues, currSeason) {
    console.log('getMinLeagueLevel', leagues.length, currSeason);
    var minLevel = 1;

    _.each(leagues, function(league){
        if (league.level > minLevel && league.seasons[currSeason] && league.seasons[currSeason].teams.length > 0) {
            minLevel = league.level;
        }
    });
    return minLevel;
}

function getLowLevelTeams(leagues, minLevel, currSeason) {
    var teams = [];
    var leagueTeams = [];
    _.each(leagues, function(league){
        if (league.seasons[currSeason]) leagueTeams = league.seasons[currSeason].teams;

        if (league.level === minLevel && leagueTeams[0]) {
            teams = teams.concat(leagueTeams);
        }
    });
    if (!teams[0] && minLevel > 0) {
        teams = getLowLevelTeams(leagues, minLevel - 1, currSeason);
    }
    return teams;
}

function getBotTeam(teams) {
    var info = null;
    var team = null;
    teams = _.sortBy(teams, 'win').reverse();
    for (var i=0; i<teams.length; i++) {
        team = teams[i];
        info = UserInfo.findOne({team_id: team.team_id});
        if (!info) {
            return team;
        }
    }
}