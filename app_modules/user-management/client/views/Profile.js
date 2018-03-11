import { Template } from 'meteor/templating';
import userinfoModel from './../models/userinfo-clientmodel';

Template.Profile.onCreated(function(){
    initData();
});

Template.Profile.helpers({
    rdata: function () {
        var tpl = Template.instance();
        return tpl.rdata.get();
    },
    email: function() {
        if (!Meteor.user()) return null;
        return Meteor.user().emails[0].address;
    },
    team: function() {
        if (!Session.get('team')) return null;
        return {
            name: Session.get('team').name,
            logo: Session.get('team').logo
        };
    },
    isVerified: isVerified
});

Template.Profile.events({
    'click .set-team-name': setTeamName,
    'click .set-arena-name': setArenaName,
    'click .set-fanclub-name': setFanclubName,
    'click .set-email': setEmail,
    'click .set-password': setPassword,
    'click .set-club-logo': setClubLogo,
    'click #send-verification-email': verifyEmail
});

function isVerified() {
    var tpl = Template.instance();
    const user = Meteor.user();
    const verifiedEmail = (user.emails && user.emails[0] && user.emails[0].verified);
    return tpl.cdata.accountVerified.get() || verifiedEmail;
}

function initData() {
    var tpl = Template.instance();
    tpl.rdata = new ReactiveVar({});
    tpl.cdata = {
        accountVerified: new ReactiveVar(false)
    };

    fetchData(tpl.rdata);

    userinfoModel.isAccountVerified((accountVerified) => {
        tpl.cdata.accountVerified.set(accountVerified);
    });
}

function fetchData(dataContext) {
    Meteor.call('profile:getArena', function (error, result) {
        console.log('user-management:arena', result);
        dataContext.set({
            arena:result
        });
    });
}

function setTeamName(e) {
    e.preventDefault();
    var val = $('.profile-team-name').val();
    if (_isSame(val, Session.get('team').name, 'team name')) return;
    var lengthValidation = butils.validations.lengthBetween(val, 3,42);
    if (lengthValidation.valid) {
        Meteor.call('profile:setTeamName', val, function (error, result) {
            if (error) {
                sAlert.error(error.reason);
            } else {
                sAlert.success('You have successfuly changed the name of your team');
            }
        });
    } else {
        sAlert.error('Team name ' + lengthValidation.error);
    }
}

function setArenaName(e) {
    e.preventDefault();
    var val = $('.profile-arena-name').val();
    var tpl = Template.instance();
    if (_isSame(val, tpl.rdata.get().arena.arenaname, 'arena name')) return;
    var lengthValidation = butils.validations.lengthBetween(val, 2,18);
    if (lengthValidation.valid) {
        Meteor.call('profile:setArenaName', val, function (error, result) {
            if (error) {
                sAlert.error(error.reason);
            } else {
                sAlert.success('You have successfuly changed the name of your arena');
            }
        });
    } else {
        sAlert.error('Arena name ' + lengthValidation.error);
    }
}

function setFanclubName(e) {
    e.preventDefault();
    var val = $('.profile-fanclub-name').val();
    var tpl = Template.instance();
    var lengthValidation = butils.validations.lengthBetween(val, 2,18);
    if (_isSame(val, tpl.rdata.get().arena.cheer_name, 'fanclub name')) return;
    if (lengthValidation.valid) {
        Meteor.call('profile:setFanClubName', val, function (error, result) {
            if (error) {
                sAlert.error(error.reason);
            } else {
                sAlert.success('You have successfuly changed the name of your fanclub');
            }
        });
    } else {
        sAlert.error('Fanclub name ' + lengthValidation.error);
    }
}

function setEmail(e) {
    e.preventDefault();
    var val = $('.profile-email').val();
    if (_isSame(val, Meteor.user().emails[0].address, 'email')) return;

    var emailValidation = butils.validations.email(val);
    if (emailValidation.valid) {
        Meteor.call('profile:setNewEmail', val, function (error, result) {
            if (error) {
                sAlert.error(error.reason);
            } else {
                sAlert.success('You have successfuly changed your email');
            }
        });
    } else {
        sAlert.error(emailValidation.error);
    }
}

function setPassword(e) {
    e.preventDefault();
    var newPass = $('.profile-new-password').val();
    var oldPass = $('.profile-old-password').val();

    if (newPass.length < 6) {
        sAlert.error('Password must be at least 6 characters long');
        return;
    }

    Accounts.changePassword(oldPass, newPass, function(error){
        if (error) {
            console.log('password error', error);
            if (error.reason === 'Incorrect password') {
                sAlert.error('Incorrect old password');
            } else {
                sAlert.error(error.reason);
            }
        } else {
            sAlert.success('You have successfuly changed your password');
        }
    });
}

function setClubLogo(e) {
    e.preventDefault();
    Modal.show('EmptyModal', {
        modalContentName: 'LogoSet',
        widthPrg: '80%'
    });
}

function verifyEmail() {
    Meteor.call('profile:send-verification-email', function (err) {
        if (err) {
            sAlert.error(err.reason);
        } else {
            sAlert.success('Email verification has been sent. Check your email and also your spam box, just in case.');
        }
    });
}

function _isSame(newName, oldName, whichName) {
    if (newName === oldName) {
        sAlert.error('New ' + whichName + ' should be different than previous one');
        return true;
    } else {
        return false;
    }
}