import { Template } from 'meteor/templating'

Template.CreateClub.onCreated(function(){
    this.cData = {
        usernameCheckTimer: null,
        teamnameCheckTimer: null,
        usernameLabel: new ReactiveVar('Username'),
        teamnameLabel: new ReactiveVar('Team Name'),
        countryLabel: new ReactiveVar('Country')
    };
});

Template.CreateClub.onRendered(function(){
    hideMenu();
    populateCountries();
});

Template.CreateClub.events({
    'keyup .create-username': fireCheckUsername,
    'keyup .create-team-name': fireCheckTeamName,
    'change #create-country': checkCountry,
    'submit form': createTeam
});

Template.CreateClub.helpers({
    'usernameLabel': function(){
        console.log('usernameLabel called');
        var tpl = Template.instance();
        return tpl.cData.usernameLabel.get();
    },
    'teamnameLabel': function(){
        var tpl = Template.instance();
        return tpl.cData.teamnameLabel.get();
    },
    'countryLabel': function(){
        var tpl = Template.instance();
        return tpl.cData.countryLabel.get();
    },
    displayUsername: function() {
        if (Meteor.user() && Meteor.user().username) return 'none';
        return 'block';
    },
    getUsername: function() {
        if (Meteor.user() && Meteor.user().username) return Meteor.user().username;
        return '';
    }
});

function populateCountries() {
    var countries = butils.general.countries();
    countries.forEach(function (country) {
        $('#create-country').append($('<option>', {
            value: country,
            text: country,
            class: 'opt-country'
        }));
    });
}

function fireCheckUsername() {
    var tpl = Template.instance();
    clearTimeout(tpl.usernameCheckTimer);

    var username = $('.create-username').val();
    username = replaceSpecialChar(username);

    tpl.usernameCheckTimer = setTimeout(function(){
        checkUsername(username, tpl);
    }, 750);

    tpl.$('.form-username').removeClass('has-error');
}

function fireCheckTeamName() {
    var tpl = Template.instance();
    clearTimeout(tpl.teamnameCheckTimer);

    var teamname = $('.create-team-name').val();

    tpl.teamnameCheckTimer = setTimeout(function(){
        checkTeamName(teamname, tpl);
    }, 750);

    tpl.$('.form-teamname').removeClass('has-error');
}

function checkUsername(username, tpl) {
    Meteor.call('user-management:userinfo:usernameValidation', username, function(err, result){
        if (err) {
            sAlert.error(error.reason);
            return;
        }
        if (result.valid) {
            tpl.$('.form-username').addClass('has-success');
            tpl.cData.usernameLabel.set('Username');
        } else {
            tpl.cData.usernameLabel.set('Username - ' + result.reason);
            tpl.$('.form-username').removeClass('has-success');
            tpl.$('.form-username').addClass('has-error');
        }
    });
}

function checkTeamName(teamname, tpl) {
    Meteor.call('user-management:userinfo:teamnameValidation', teamname, function(err, result){
        if (err) {
            sAlert.error(error.reason);
            return;
        }
        if (result.valid) {
            tpl.$('.form-teamname').addClass('has-success');
            tpl.cData.teamnameLabel.set('Team Name');
        } else {
            tpl.cData.teamnameLabel.set('Team Name - ' + result.reason);
            tpl.$('.form-teamname').removeClass('has-success');
            tpl.$('.form-teamname').addClass('has-error');
        }
    });
}

function checkCountry() {
    console.log('check country fired');
    var tpl = Template.instance();
    var country = $('#create-country').val();
    var countries = butils.general.countries();
    if (_.contains(countries, country)) {
        tpl.$('.form-country').addClass('has-success');
        tpl.cData.countryLabel.set('Country');
    } else {
        tpl.$('.form-country').removeClass('has-success');
        tpl.$('.form-country').addClass('has-error');
        tpl.cData.countryLabel.set('Country - Please select a valid country');
    }
}

function createTeam(e) {
    e.preventDefault();
    var tpl = Template.instance();
    var username = tpl.$('#create-username').val();
    var teamname = tpl.$('#create-team-name').val();
    var country = tpl.$('#create-country').val();

    tpl.$('.user-creation').remove();
    tpl.$('.user-waiting').show();
    Meteor.call('user-management:userinfo:createTeam', username, teamname, country, function (error, result) {
        if (error) {
            sAlert.error(error.reason);
        } else {
            window.location = '/club';
            sAlert.success('Your club have been created! Good luck and have fun!');
        }
    });
}

function replaceSpecialChar(username) {
    var res = username.replace(/ /g, "");
    $('.create-username').val(res);
    return res;
}

function hideMenu() {
    $('.menuRow').hide();
}

function showMenu() {
    $('.menuRow').show();
}