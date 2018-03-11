import { Accounts } from 'meteor/accounts-base';
import userModel from './../models/user-model';

Meteor.methods({
    'profile:getArena': getUserArena,
    'profile:setTeamName': setTeamName,
    'profile:setArenaName': setArenaName,
    'profile:setFanClubName': setFanClubName,
    'profile:setNewEmail': setNewEmail,
    'profile:setNewLogo': setNewLogo,
    'profile:isAccountVerified': isAccountVerified,
    'profile:send-verification-email': sendVerificationEmail
});

function getUserArena() {
    return Arenas.getByUserid(this.userId, {fields:{arenaname:1, cheer_name:1}});
}

function sendVerificationEmail() {
    Accounts.sendVerificationEmail(this.userId);
}

function setTeamName(name) {
    var lengthValidation = butils.validations.lengthBetween(name, 3,42);
    var profaneValidation = sbutils.validations.profanity(name);

    if (!lengthValidation.valid) throw new Meteor.Error("invalid-length", "Team name " + lengthValidation.error);
    if (!profaneValidation.valid) throw new Meteor.Error("profane", "Team name " + profaneValidation.error);

    var team = Teams.getByUserid(this.userId);
    if (team.name === name) throw new Meteor.Error("same-name", "New team name is the same as the current one");
    if (Teams.find({name:name}).count()!==0) throw new Meteor.Error("existing-name", "The name is already taken by other team");

    Teams.update({_id: team._id}, {
        $set: {name: name},
        $push: {
            'history.name': {
                name: team.name,
                changedAt: new Date()
            }
        }
    });
}

function setArenaName(name) {
    var lengthValidation = butils.validations.lengthBetween(name, 2,18);
    var profaneValidation = sbutils.validations.profanity(name);

    if (!lengthValidation.valid) throw new Meteor.Error("invalid-length", "Arena name " + lengthValidation.error);
    if (!profaneValidation.valid) throw new Meteor.Error("profane", "Arena name " + profaneValidation.error);

    var arena = Arenas.getByUserid(this.userId, {fields:{_id:1, arenaname:1}});
    if (arena.arenaname === name) throw new Meteor.Error("same-name", "New arena name is the same as the current one");

    Arenas.update({_id: arena._id}, {
        $set: {arenaname: name},
        $push: {
            'history.name': {
                name: arena.arenaname,
                changedAt: new Date()
            }
        }
    });
}

function setFanClubName(name) {
    var lengthValidation = butils.validations.lengthBetween(name, 2,18);
    var profaneValidation = sbutils.validations.profanity(name);

    if (!lengthValidation.valid) throw new Meteor.Error("invalid-length", "Arena name " + lengthValidation.error);
    if (!profaneValidation.valid) throw new Meteor.Error("profane", "Arena name " + profaneValidation.error);

    var arena = Arenas.getByUserid(this.userId, {fields:{_id:1, cheer_name:1}});
    if (arena.cheer_name === name) throw new Meteor.Error("same-name", "New fanclub name is the same as the current one");

    Arenas.update({_id: arena._id}, {
        $set: {cheer_name: name},
        $push: {
            'history.name': {
                name: arena.cheer_name,
                changedAt: new Date()
            }
        }
    });
}

function setNewEmail(email) {
    var user = Meteor.users.findOne({_id: this.userId});
    if (email === user.emails[0].address) throw new Meteor.Error("same-email", "New email is the same as the current one");

    var emailValidation = butils.validations.email(email);
    if (!emailValidation.valid) throw new Meteor.Error("invalid-email", "New email is not valid");

    if (Accounts.findUserByEmail(email) !== undefined) throw new Meteor.Error("already-in-use", email + " is already used by a different user");

    Meteor.users.update({_id: this.userId}, {
        $set: {
            'emails.0.address': email,
            'emails.0.verified': false
        },
        $push: {
            'history.email': {
                address: user.emails[0].address,
                changedAt: new Date()
            }
        }
    });
}

function setNewLogo(logo) {
    var team = Teams.getByUserid(this.userId, {fields:{_id:1}});
    var imgFormat = logo.slice(-3).toLowerCase();

    if (logo === '' || logo.length > 2083) throw new Meteor.Error("no-logo", "No logo selected");
    if (!(imgFormat === 'gif' || imgFormat === 'jpg' || imgFormat === 'png')) throw new Meteor.Error("invalid-format", "Image format not supported. The logo needs to be jpg, png or gif");

    Teams.update({_id: team._id}, {
        $set: {logo: logo},
        $push: {
            'history.logo': {
                logo: team.logo,
                changedAt: new Date()
            }
        }
    });
}

function isAccountVerified() {
    return userModel.isAccountVerified(this.userId);
}