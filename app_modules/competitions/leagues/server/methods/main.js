import playoff from './../playoff.js';
import leagueUpdates from './../updates.js';
import leagueDataModel from './../models/league-datamodel.js';
Meteor.methods({
    'competitions:leagues:playoff:schedule': function () {
        if (!sbutils.validations.isAdmin(this.userId)) return;
        playoff.schedule();
    },
    'competitions:leagues:playoff:reset': function() {
        if (!sbutils.validations.isAdmin(this.userId)) return;
        playoff.reset();
    },
    'competitions:leagues:playoff:play': function() {
        if (!sbutils.validations.isAdmin(this.userId)) return;
        playoff.play();
    },
    'competitions:leagues:playoff:update': function() {
        if (!sbutils.validations.isAdmin(this.userId)) return;
        playoff.updateAll();
    },
    'competitions:leagues:updates:scoreDifference': function() {
        if (!sbutils.validations.isAdmin(this.userId)) return;
        leagueUpdates.scoreDifference();
    },
    'competitions:leagues:updates:setState': function() {
        if (!sbutils.validations.isAdmin(this.userId)) return;
        leagueUpdates.setState();
    },

    'competitions:leagues:getLeagueAndInfo': getLeagueAndInfo
});

function getLeagueAndInfo(country, level, series, season) {
    return leagueDataModel.getLeagueAndInfo(country, level, series, season);
}