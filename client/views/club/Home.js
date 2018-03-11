import { Template } from 'meteor/templating';
import { Blaze } from 'meteor/blaze'

import userinfoModel from './../../../app_modules/user-management/client/models/userinfo-clientmodel.js';
import teamModel from './../../../app_modules/teams/client/models/team-clientmodel.js';
import arenaModel from './../../../app_modules/facilities/client/models/arena-clientmodel.js';
import playersModel from './../../../app_modules/players/client/models/players-clientmodel.js';
import matchesModel from './../../../app_modules/matches/client/models/matches-clientmodel.js';
import gameInfoModel from './../../../app_modules/admin/client/models/gameinfo-clientmodel.js';

Template.Home.onCreated(function(){
    var self = this;
    this.cdata = {
        userinfo: new ReactiveVar(null),
        team: new ReactiveVar(null),
        arena: new ReactiveVar(null),
        players: new ReactiveVar([]),
        coach: new ReactiveVar(null),
        season: new ReactiveVar(null)
    };

    this.autorun(function(){
        var param = Session.get('param-userinfoID');
        updateData(self, param);
    });
});

Template.Home.onRendered(function(){
    addPopovers([
        ['.center-block', 'logo', 'right'],
        ['.arena-name', 'arena-name', 'top'],
        ['.index-team-name', 'team-name', 'top'],
        ['.fans-name', 'fans-name', 'top']
        ]);
});

Template.Home.helpers({
    leagueName: function() {
        var tpl = Template.instance();
        var team = tpl.cdata.team.get();
        if (!team) return;

        var currentSeason = tpl.cdata.season.get();
        return team.competitions.natLeague.seasons[currentSeason].name;
    },
    leaguePath: function() {
        var tpl = Template.instance();
        var team = tpl.cdata.team.get();
        if (!team) return;

        var season = tpl.cdata.season.get();
        var country = team.country.toLowerCase().replace(/ /g, '-');
        var level = team.competitions.natLeague.seasons[season].level;
        var series = team.competitions.natLeague.seasons[season].series;
        return '/national/leagues/'+country+'/'+level+'/'+series+'/'+season;
    },
    arena: function () {
        var tpl = Template.instance();
        return tpl.cdata.arena.get();
    },
    team: function () {
        var tpl = Template.instance();
        return tpl.cdata.team.get();
    },
    userinfo: function() {
        var tpl = Template.instance();
        return tpl.cdata.userinfo.get();
    },
    ownClub: function() {
        var ownUserInfo = Session.get('userinfo');
        var currUserInfoStr = Session.get('param-userinfoID');

        if (!ownUserInfo) return false;

        if (!currUserInfoStr || ownUserInfo._id._str === currUserInfoStr) {
            return true;
        } else {
            return false;
        }
    }
});

Template.Home.events({
    'click .club-players': showPlayers,
    'click .club-coach': showCoach,
    'click .club-matches': showMatches,
    'click .club-history': showHistory,
    'click .club-stats': showStats,
    'click .report-logo': function(e){reportAbuse(e, 'logo')},
    'click .report-arena-name': function(e){reportAbuse(e, 'arena-name')},
    'click .report-team-name': function(e){reportAbuse(e, 'team-name')},
    'click .report-fans-name': function(e){reportAbuse(e, 'fans-name')},
    'click .reset-logo': resetLogo,
    'click .reset-arena-name': resetArenaName,
    'click .reset-team-name': resetTeamName,
    'click .reset-fans-name': resetFansName,
    'click': hideReport
});

function updateData(tpl, userinfoID) {
    if (userinfoID) {
        userinfoModel.getByID(userinfoID, function (result) {
            tpl.cdata.userinfo.set(result);

            //get team by teamID
            teamModel.getByID(result.team_id, function (res2) {
                tpl.cdata.team.set(res2);
            });

            //get arena by teamID
            arenaModel.getByTeamID(result.team_id, function (res2) {
                tpl.cdata.arena.set(res2);
            });
        });

    } else {
        userinfoModel.getOwn(function (result) {
            tpl.cdata.userinfo.set(result);
        });
        teamModel.getOwn(function (result) {
            tpl.cdata.team.set(result);
        });
        arenaModel.getOwn(function (result) {
            tpl.cdata.arena.set(result);
        });
    }

    gameInfoModel.get(function(gameInfo){
        tpl.cdata.season.set(gameInfo.season);
    });
}

function hideReport() {
    var tpl = Template.instance();
    _.each(tpl.reportVisible, function(val, key){
        if (val) $(key).popover('hide');
    });
}

function addPopovers(listOfPopovers) {
    var tpl = Template.instance();
    tpl.reportVisible = {};

    _.each(listOfPopovers, function(pop){
        _addPopover(pop[0], pop[1], pop[2]);
    });
}

function _addPopover(className, aClass, placement) {
    var tpl = Template.instance();
    tpl.reportVisible[className] = false

    if (cbutils.validations.isAdmin()) {
        $(className).popover({
            html:true,
            template: '<div class="popover" style="z-index:100" role="tooltip"><div class="arrow"></div><div class="popover-content"></div></div>',
            content: '<a href="#" class="'+'report-'+aClass+'" style="color: #C21315"><span class="ion-alert-circled"> Report Abuse </span></a> <br>' +
                     '<a href="#" class="'+'reset-'+aClass+'" style="color: #C21315"><span class="ion-refresh"> Reset Value </span></a> <br>',
            placement: placement
        });
    } else {
        $(className).popover({
            html:true,
            template: '<div class="popover" style="z-index:100" role="tooltip"><div class="arrow"></div><div class="popover-content"></div></div>',
            content: '<a href="#" class="'+'report-'+aClass+'" style="color: #C21315"><span class="ion-alert-circled"> Report Abuse </span></a>',
            placement: placement
        });
    }

    $(className).on('shown.bs.popover', function () {
        tpl.reportVisible[className] = true;
    });

    $(className).on('hide.bs.popover', function () {
        tpl.reportVisible[className] = false;
    });
}

function showPlayers(event) {
    event.preventDefault();
    var tpl = Template.instance();
    //get players
    playersModel.getByTeamID(tpl.cdata.team.get()._id, function(response) {
        tpl.cdata.players.set(_.where(response, {coach:0}));
        Modal.show('Modal', {
            modalName: 'Players',
            modalContentName: 'PlayerOptions',
            players: tpl.cdata.players.get()
        });
    });
}

function showCoach(event) {
    event.preventDefault();
    var tpl = Template.instance();
    //get players
    playersModel.getByTeamID(tpl.cdata.team.get()._id, function(response) {
        tpl.cdata.coach.set(_.where(response, {coach:1})[0]);
        Modal.show('Modal', {
            modalName: 'Coach',
            modalContentName: 'CoachModal',
            coach: tpl.cdata.coach.get()
        });
    });
}
function showMatches(event) {
    event.preventDefault();
    var tpl = Template.instance();
    var team = tpl.cdata.team.get();

    matchesModel.getPlayedMatchesByTeamID(team._id, function(matches){
        matches = _.sortBy(matches, function(match){
            return match.dateTime.timestamp;
        });
        matches.reverse();
        Modal.show('Modal', {
            modalName: 'Matches',
            modalContentName: 'MatchesOptions',
            matches: matches,
            widthPrg: '60%'
        });
    });
}

function showHistory(event) {
    event.preventDefault();
}
function showStats(event) {
    event.preventDefault();
    var tpl = Template.instance();
    var team = tpl.cdata.team.get();
    Modal.show('EmptyModal', {
        modalContentName: 'TeamStatsCard',
        stats: team.stats,
        name: team.name,
        widthPrg: '80%'
    });
}

function reportAbuse(e, reported) {
    e.preventDefault();
    var tpl = Template.instance();
    Meteor.call('admin:user-reports:abuse', tpl.data.team._id, reported, function (error, result) {
        if (error) {
            sAlert.error('Oops! Something went wrong. Please try reporting again or contact the administrator');
        } else {
            sAlert.success('Thanks for your help on improving Basketsim. Your report will be reviewed soon!');
        }
    });
}

function resetLogo() {
    if (!cbutils.validations.isAdmin()) return;
    var tpl = Template.instance();

    Meteor.call('profile:admin:resetLogo', tpl.data.team._id, function (error, result) {
        if (error) {
            sAlert.error(error.reason);
        } else {
            sAlert.success('Logo has been reseted');
        }
    });
}

function resetArenaName() {
    if (!cbutils.validations.isAdmin()) return;
    var tpl = Template.instance();

    Meteor.call('profile:admin:resetArenaName', tpl.data.team._id, function (error, result) {
        if (error) {
            sAlert.error(error.reason);
        } else {
            sAlert.success('Arena name has been reseted');
        }
    });
}

function resetTeamName() {
    if (!cbutils.validations.isAdmin()) return;
    var tpl = Template.instance();

    Meteor.call('profile:admin:resetTeamName', tpl.data.team._id, function (error, result) {
        if (error) {
            sAlert.error(error.reason);
        } else {
            sAlert.success('Team name has been reseted');
        }
    });
}

function resetFansName() {
    if (!cbutils.validations.isAdmin()) return;
    var tpl = Template.instance();

    Meteor.call('profile:admin:resetFanClubName', tpl.data.team._id, function (error, result) {
        if (error) {
            sAlert.error(error.reason);
        } else {
            sAlert.success('Fans name has been reseted');
        }
    });
}