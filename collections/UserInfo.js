global.UserInfo = new Mongo.Collection('userinfo', {idGeneration: 'MONGO'});

var self = this;

UserInfo.getCurrent = function () {
    console.log('was called from client');
    return UserInfo.findOne({_id: Meteor.user().userInfo_id});
};
UserInfo.getByID = function(id) {
    return UserInfo.findOne({_id: id});
};

export default UserInfo;
