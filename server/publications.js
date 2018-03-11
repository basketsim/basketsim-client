Meteor.publish("userData", function () {
  if (this.userId) {
    var user = Meteor.users.find({_id: this.userId},
                             {fields: {'userInfo_id': 1}});
    var userinfo = UserInfo.find({_id: user.fetch()[0].userInfo_id}, {fields: Fields.userinfo.own});
    return [user, userinfo];
  } else {
    this.ready();
  }
});

Meteor.publish('own-natleague', function () {
    if (!this.userId) return this.ready();

    var team = getTeam(this);
    var natLeague = NatLeagues.find({_id: team.fetch()[0].competitions.nat_league_id});
    var teamsArray = natLeague.fetch()[0].teams;
    var teamsidArray = [];

    for (var i=0; i<teamsArray.length; i++) {
        teamsidArray.push(teamsArray[i].team_id);
    }
    var leagueTeames = Teams.find({_id: {$in: teamsidArray }}, {fields: {name: true, logo: true, shirt: true}});
    var userInfos = UserInfo.find({team_id: {$in: teamsidArray }}, {fields: {username: true, is_online: true, supporter: true, team_id: true}});

    return [natLeague, leagueTeames, userInfos];
});
/*
Will need to make separation between next - with less info and previous, with more info
 */
Meteor.publish('league-matches', function(){
    if (!this.userId) return this.ready();

    var team = getTeam(this);
    var natLeague = NatLeagues.find({_id: team.fetch()[0].competitions.nat_league_id});
    var league = natLeague.fetch()[0];
    var leagueId = league._id,
        nextRound = league.nextRound;
    var lastRound = nextRound - 1;
    // var matches = Matches.find({"competition.type": 'NAT_LEAGUE', "competition.id": leagueId, round: {$in: [lastRound, nextRound]}},
    //     {fields:{
    //         _id:true,
    //         'homeTeam.id': true,
    //         'awayTeam.id': true,
    //         round: true,
    //         competition:true,
    //         date:true
    //     }});

    var matches = Matches.find({"competition.type": 'NAT_LEAGUE', "competition.id": leagueId, round: {$in: [lastRound, nextRound]}});

    return matches;
});

Meteor.publish('test-match', function(){
    return Matches.find({_id: 'gwG3utjZiPLDcPSCZ'});
});

Meteor.publish('arena', function (id) {
    if (!this.userId) return this.ready();
    var team = getTeam(this, id);
    var arena;

    if (canSeeDetails(this, id)) {
        arena = Arenas.find({team_id: team.fetch()[0]._id});
    }
    else {
        arena = Arenas.find({team_id: team.fetch()[0]._id}, {fields: {
            arenaname: true,
            cheer_logo: true,
            cheer_name: true,
            fans: true,
            court_end: true,
            court_side: true,
            upper_level: true,
            vip: true,
            team_id: true

        }});
    }


    return arena;
});

Meteor.publish('userInfo', function(userInfoId){
    return getUserInfo(this, userInfoId);
});

Meteor.publish('team', function(userInfoID){
    return getTeam(this, userInfoID);
});

Meteor.publish('allTeams', function(){
    return Teams.find({}, {limit: 30});
});

function getUserInfo(self, userInfo_id) {
    var loggedUser = Meteor.users.findOne({_id: self.userId});
    var userInfo;

    if (!userInfo_id) {
        userInfo = UserInfo.find({_id: loggedUser.userInfo_id}, {fields: {
                password: false
            }});
    } else {
        userInfo = UserInfo.find({_id: new Meteor.Collection.ObjectID(userInfo_id)}, {fields: {
                username: true,
                team_id: true,
                friendly: true,
                supporter: true,
                achievements:true
            }});
    }


    return userInfo;
}

function getTeam(self, userInfoID) {
    var userInfo = getUserInfo(self, userInfoID);
    var teamId = userInfo.fetch()[0].team_id;
    var team;

    if (canSeeDetails(self, userInfoID)) {
        team = Teams.find({_id: teamId});
    } else {
        team = Teams.find({_id: teamId}, {fields: {
            arena_name: true,
            city: true,
            country: true,
            logo: true,
            name: true,
            short_name: true
        }});
    }

    return team;
}

function canSeeDetails(self, userInfoID) {
    var canSee = false;
    if (Meteor.users.findOne({_id: self.userId}).userInfo_id == userInfoID || !userInfoID) {
        canSee = true;
    }

    return canSee;
}