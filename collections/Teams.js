/*
Team Schema:
id: int
manager: userid
players: [playerid1, playerid2, ...]
 */
global.Teams = new Mongo.Collection('teams', {idGeneration: 'MONGO'});

Teams.getRaw = function(teamId) {
	return Teams.findOne({_id: teamId});
};
Teams.getByUserid = function(userid, options) {
    var user = Meteor.users.findOne({_id: userid});
    console.log('userid', userid);
    var userInfo = UserInfo.findOne({_id: user.userInfo_id}, {fields: {team_id:1}});
    var team = Teams.findOne({_id: userInfo.team_id}, options);

    return team;
};
Teams.getByUserInfoId = function(userInfoId) {
    var userInfo = UserInfo.findOne({_id: userInfoId});
    return Teams.findOne({_id: userInfo.team_id});
};
Teams.getActive = function() {
    var userInfo = UserInfo.find().fetch();
    var activeTeams = [];
    _.each(userInfo, function(user){
        activeTeams.push(user.team_id);
    });

    return Teams.find({_id: {$in: activeTeams}}).fetch();
};
Teams.getActiveIDs = function() {
    var userInfo = UserInfo.find({}, {fields: {team_id: true}}).fetch();
    var activeTeams = [];
    _.each(userInfo, function(user){
        activeTeams.push(user.team_id);
    });

    return Teams.find({_id: {$in: activeTeams}}, {fields: {_id: true}}).fetch();
}
Teams.getFromMatchId = function(matchid) {
    var match = Matches.findOne({_id: matchid});
    var homeTeam = Teams.findOne({_id: match.homeTeam.id});
    var awayTeam = Teams.findOne({_id: match.awayTeam.id});
    return {
        homeTeam: homeTeam,
        awayTeam: awayTeam
    };
};

export default Teams;
