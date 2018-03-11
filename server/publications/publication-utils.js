global.pubUtils = {
    getUserInfo: getUserInfo,
    getTeam: getTeam,
    canSeeDetails: canSeeDetails,
    matchesTeamsCursor: matchesTeamsCursor

};

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
                supporter: true
            }});
    }


    return userInfo;
}

function getTeam(self, userInfoID) {
    var userInfo = getUserInfo(self, userInfoID);
    var teamId = userInfo.fetch()[0].team_id;
    var team;

    if (canSeeDetails(self, userInfoID)) {
        team = Teams.findOne({_id: teamId});
    } else {
        team = Teams.findOne({_id: teamId}, {fields: {
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

function matchesTeamsCursor(matchesCursor) {
    var matches = matchesCursor.fetch();
    var teamids = [];
    _.each(matches, function(match){
        teamids.push(match.homeTeam.id);
        teamids.push(match.awayTeam.id);
    });
    var teams = Teams.find({_id: {$in:teamids}}, {fields:{
                arena_name: true,
                city: true,
                country: true,
                logo: true,
                name: true,
                short_name: true
            }});

    return teams;
}