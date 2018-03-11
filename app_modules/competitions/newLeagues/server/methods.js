import seasonUpdates from './season-updates.js';
import newSeason from './new-season.js';
import matchScheduling from './schedule-matches.js';
import leagueModel from './models/model.js';
import teamModel from './../../../teams/server/model.js';
import createSeries from './actions/create-series.js';
import leagueWildCards from './actions/league-wildcards.js';
import reshuffleLeagues from './actions/reshuffle-leagues.js';
import updateCompReferece from './actions/update-competition-reference';

Meteor.methods({
    'competitions:newLeagues:endRegularSeason': function() {
        if (!sbutils.validations.isAdmin(this.userId)) return;
        seasonUpdates.endRegularSeason();
    },
    'competitions:newLeagues:insertPlayoff': function() {
        if (!sbutils.validations.isAdmin(this.userId)) return;
        seasonUpdates.insertPlayoff();
    },
    'competitions:newLeagues:playoff:rescheduleMatches': function() {
        if (!sbutils.validations.isAdmin(this.userId)) return;
        seasonUpdates.reschedulePlayoffMatches();
    },
    'competitions:newLeagues:sendRewards': function() {
        if (!sbutils.validations.isAdmin(this.userId)) return;
        seasonUpdates.sendRewards();
    },
    'competitions:newLeagues:setScoreDifference': function() {
        if (!sbutils.validations.isAdmin(this.userId)) return;
        seasonUpdates.setScoreDifference();
    },
    'competitions:newLeagues:wildcards': function(){
        if (!sbutils.validations.isAdmin(this.userId)) return;
        leagueWildCards();
    },
    'competitions:newLeagues:reshuffle': function(){
        if (!sbutils.validations.isAdmin(this.userId)) return;
        reshuffleLeagues();
    },
    'competitions:newLeagues:updateCompReference': function () {
        if (!sbutils.validations.isAdmin(this.userId)) return;
        updateCompReferece();
    },
    'competitions:newLeagues:insertLeagues': function() {
        if (!sbutils.validations.isAdmin(this.userId)) return;
        newSeason.insertMulti();
    },
    'competitions:newLeagues:scheduleMatches': function() {
        if (!sbutils.validations.isAdmin(this.userId)) return;
    },
    'competitions:newLeagues:schedule-matches:schedule': function() {
        if (!sbutils.validations.isAdmin(this.userId)) return;
        matchScheduling.schedule();
    },
    'competitions:newLeagues:schedule-matches:check': function() {
        if (!sbutils.validations.isAdmin(this.userId)) return;
        matchScheduling.check();
    },
    'competitions:newLeagues:schedule-matches:check': function() {
        if (!sbutils.validations.isAdmin(this.userId)) return;
        matchScheduling.check();
    },
    /* Romania Tests */
    'test:competitions:newLeagues:endRegularSeason': function() {
        if (!sbutils.validations.isAdmin(this.userId)) return;
        seasonUpdates.endRegularSeason(['Romania']);
    },
    'test:competitions:newLeagues:insertPlayoff': function() {
        if (!sbutils.validations.isAdmin(this.userId)) return;
        seasonUpdates.insertPlayoff(['Romania']);
    },
    'test:competitions:newLeagues:sendRewards': function() {
        if (!sbutils.validations.isAdmin(this.userId)) return;
        seasonUpdates.sendRewards(['Romania']);
    },
    'test:competitions:newLeagues:setScoreDifference': function() {
        if (!sbutils.validations.isAdmin(this.userId)) return;
        seasonUpdates.setScoreDifference(['Romania']);
    },
    'test:competitions:newLeagues:wildcards': function() {
        if (!sbutils.validations.isAdmin(this.userId)) return;
        leagueWildCards(['Romania']);
    },
    'test:competitions:newLeagues:reshuffle': function(){
        if (!sbutils.validations.isAdmin(this.userId)) return;
        reshuffleLeagues(['Romania']);
    },
    'test:competitions:newLeagues:insertLeagues': function() {
        if (!sbutils.validations.isAdmin(this.userId)) return;
        newSeason.insertMulti(['Romania']);
    },
    'test:competitions:newLeagues:scheduleMatches': function() {
        if (!sbutils.validations.isAdmin(this.userId)) return;
    },
    'test:competitions:newLeagues:schedule-matches:schedule': function() {
        if (!sbutils.validations.isAdmin(this.userId)) return;
        matchScheduling.schedule(['Romania']);
    },
    'test:competitions:newLeagues:schedule-matches:check': function() {
        if (!sbutils.validations.isAdmin(this.userId)) return;
        matchScheduling.check(['Romania']);
    },

    /** TOOL METHODS */
    'competitions:newLeagues:tools:botsPercentageCountry': function() {
        if (!sbutils.validations.isAdmin(this.userId)) return;
        botsPercentage();
    },
    'competitions:newLeagues:tools:newSeries': function(country) {
        if (!sbutils.validations.isAdmin(this.userId)) return;
        createSeries(country);
    }
});

function botsPercentage() {
        var countries = butils.general.countries();
        var cs = GameInfo.findOne().season;
        countries.forEach(function (country) {
            let leagues = Leagues.find({country: country}).fetch();
            let minLevel = 1,
                bots = [],
                teamsID = [],
                botsPercentage = 0;
            minLevel = leagueModel.getMinLeagueLevel(leagues, cs);
            leagues = _.where(leagues, {level: minLevel});
            teamsID = leagueModel.teamsFromLeagues(leagues, cs).teamsIDStr;
            bots = teamModel.botsInList(teamsID);

            botsPercentage = butils.math.twoDecs(bots.length/teamsID.length) * 100;
            console.log(`Bots Percentage in ${country} is ${botsPercentage}% - total teams: ${teamsID.length}, bot teams: ${bots.length}`);
        });
}