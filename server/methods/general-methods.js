import {Meteor} from "meteor/meteor";

Meteor.methods({
    forumAuth: forumAuth,
    discourseSSO: discourseSSO
});

function discourseSSO() {
    HTTP.call('HEAD', 'http://forum.basketsim.com/session/sso', function (err, res) {
    });
}

function forumAuth (sig, payload) {
    if (!Meteor.userId()) {
        return 'USER_NOT_LOGGED';
    }
    var sso = new discourse_sso(Meteor.settings.discourse_sso);

    var nonce = '';
    var userparams = {};
    var user =  Meteor.user();
    var userinfo = UserInfo.findOne({_id: user.userInfo_id});

    if(sso.validate(payload, sig)) {
        nonce = sso.getNonce(payload);
        userparams = {
            // Required, will throw exception otherwise
            "nonce": nonce,
            "external_id": user._id,
            "email": user.emails[0].address,
            // Optional
            "username": userinfo.username,
            "name": userinfo.realname,
            "require_activation": false
        };
        var q = sso.buildLoginString(userparams);
        return q;
    }
}