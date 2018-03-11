import userCreation from './../new-users/creation.js';
import userinfoDataModel from './../models/userinfo-datamodel.js';
import {Mongo} from 'meteor/mongo';

Meteor.methods({
    'user-management:userinfo:usernameValidation': usernameValidation,
    'user-management:userinfo:teamnameValidation': teamnameValidation,
    'user-management:userinfo:createTeam': createTeam,
    /*model-methods (aka getters)*/
    'user-management:userinfo:getCurrentUserInfo': getCurrentUserInfo,
    'user-management:userinfo:getByID': getByID,
    'user-management:userinfo:userHasUserInfo': userHasUserInfo,
    'user-management:userinfo:logged-in': loggedIn
});

function usernameValidation(username) {
        var lengthValidation = butils.validations.lengthBetween(username, 2,25);
        var profaneValidation = sbutils.validations.profanity(username);

        var validation = {
            valid: true,
            reason: 'Username is valid'
        }

        if (!lengthValidation.valid) {
            validation = {
                valid: false,
                reason: 'Username length must be between 2 and 25 characters'
            }
        }

        if (!profaneValidation.valid) {
            validation = {
                valid: false,
                reason: 'Username cannot contain prophane or reserved words'
            }
        }

        var count = UserInfo.find({$or: [{username: username}, {login_name:username}]}, {fields:{_id:1}}).count();

        if (count !== 0)  {
            validation = {
                valid: false,
                reason: 'Username is already taken. Please try another one'
            }
        }

        return validation;
}

function teamnameValidation(teamname) {
        var lengthValidation = butils.validations.lengthBetween(teamname, 3,42);
        var profaneValidation = sbutils.validations.profanity(teamname);

        var validation = {
            valid: true,
            reason: 'Team name is valid'
        }

        if (!lengthValidation.valid) {
            validation = {
                valid: false,
                reason: 'Team name length must be between 3 and 42 characters'
            }
        }

        if (!profaneValidation.valid) {
            validation = {
                valid: false,
                reason: 'Team name cannot contain prophane or reserved words'
            }
        }

        var count = Teams.find({name: teamname}, {fields:{_id:1}}).count();

        if (count !== 0)  {
            validation = {
                valid: false,
                reason: 'Team name is already taken. Please choose another one'
            }
        }

        return validation;
}

function countryValidation(country) {
    var countries = butils.general.countries();
    var validation = {
        valid: true,
        reason: 'Selected country is valid'
    }

    if (!_.contains(countries, country)) {
        validation = {
            valid: false,
            reason: 'Selected country is not valid'
        }
    }

    return validation;
}

function createTeam(username, teamname, country) {
    var usernameV = usernameValidation(username);
    var teamnameV = teamnameValidation(teamname);
    var countryV = countryValidation(country);

    if (!usernameV.valid) throw new Meteor.Error('invalid-username', usernameV.reason);
    if (!teamnameV.valid) throw new Meteor.Error('invalid-teamname', teamnameV.reason);
    if (!countryV.valid) throw new Meteor.Error('invalid-country', countryV.reason);

    var user = Meteor.user();
    if (user.userInfo_id) throw new Meteor.Error('has-team', 'You already have a team');
    userCreation.insert(user, username, teamname, country);
}

function getCurrentUserInfo() {
    return userinfoDataModel.getOwn(this.userId);
}

function userHasUserInfo() {
    var user = Meteor.users.findOne({_id: this.userId});
    if (user.userInfo_id) return true;
    return false;
}

function getByID(userInfoID) {
    var id = new Mongo.ObjectID(userInfoID);
    return userinfoDataModel.getByID(id, this.userId);
}

function loggedIn() {
    var user = Meteor.users.findOne({_id: this.userId});
    UserInfo.update({_id: user.userInfo_id}, {$set: {lastlog:new Date()}}, function(){});
}


