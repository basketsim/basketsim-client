import {Meteor} from 'meteor/meteor';
import UserInfo from './../../../../collections/UserInfo.js';
import { Accounts } from 'meteor/accounts-base';

function userModel() {
    var api = { getEmail, getByTeamID, lockByTeamID, isAccountVerified, getByEmail,setEmailValidity };

    function getEmail(user) {
        var email = null;
        if (user.emails && user.emails[0]) email = user.emails[0].address;

        if (!email) {
            if (user.services.facebook) email = user.services.facebook.email;
        }

        if (!email) email = null;
        return email;
    }

    function getByTeamID(teamID) {
        const userInfoID = UserInfo.findOne({team_id: teamID}, {fields: {_id: 1}})._id;
        return Meteor.users.findOne({userInfo_id: userInfoID});
    }

    function lockByTeamID(teamID) {
        const user = getByTeamID(teamID);
        Meteor.users.update({_id: user._id}, {$set: {locked: true}});
    }

    function isAccountVerified(userID) {
        const user = Meteor.users.findOne({_id: userID});
        const hasFacebook = user.services.facebook ? true : false;
        const verifiedEmail = (user.emails && user.emails[0] && user.emails[0].verified);
        const isVerified = (hasFacebook || verifiedEmail) ? true : false;

        return isVerified;
    }

    function getByEmail(email) {
        return Meteor.users.findOne({"emails.0.address":email});
    }

    function setEmailValidity(email, isVerified) {
        Meteor.users.update({"emails.address": email}, {$set: {
            "emails.$.verified":isVerified
        }});
    }

    return api;
}

export default userModel();