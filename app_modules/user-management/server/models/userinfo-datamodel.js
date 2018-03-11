class UserInfoDataModel {
    getByID(userInfoID, reqUserID) {
        var fields = fieldRights(userInfoID, reqUserID);
        return UserInfo.findOne({_id: userInfoID}, {fields:fields});
    }
    getByUserID (userID, reqUserID) {
        var user = Meteor.users.findOne({_id: userID}, {fields: {userInfo_id:1}});
        var userinfo = this.getByID(user.userInfo_id, reqUserID);
        return userinfo;
    }
    getOwn(reqUserID) {
        var userinfoID = Meteor.users.findOne({_id: reqUserID}, {fields: {userInfo_id:1}}).userInfo_id;
        return UserInfo.findOne({_id: userinfoID});
    }
}

function fieldRights(userInfoID, reqUserID) {
    var fields = {},
        ownUserInfoID = {},
        isOwn = false;

    ownUserInfoID = Meteor.users.findOne({_id: reqUserID}, {fields:{userInfo_id:1}}).userInfo_id;
    if (ownUserInfoID._str === userInfoID._str) {
        fields = {}
    } else {
        fields = {
            national_team: 1,
            supporter_days: 1,
            team_id: 1,
            username: 1,
            achievements: 1,
            clubHistory: 1,
            signed: 1,
            lastlog: 1
        };
    }

    return fields;
}

export default new UserInfoDataModel();

