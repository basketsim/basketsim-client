import matchesModel from './../models/matches-clientmodel.js';
import teamModel from './../../../teams/client/models/team-clientmodel.js';

Template.TeamMatches.onCreated(function() {
    var self = this;

    this.cdata = {
        team: new ReactiveVar(null),
        unfinishedMatches: new ReactiveVar([]),
        finishedMatches: new ReactiveVar([])
    };

    this.autorun(function(){
        var matchesDisplayed = Session.get('param-teamMatches');
        updateData(self, matchesDisplayed);
    });
});

function updateData(tpl, matchesDisplayed) {
    teamModel.getOwn(function(team){
        tpl.cdata.team.set(team);
    });

    if (matchesDisplayed === 'unfinished') {
        matchesModel.getOwnUnfinished(function(matches){
            console.log('updateData unfinished matches', matches);
            tpl.cdata.unfinishedMatches.set(matches);
        });
    } else if (matchesDisplayed === 'finished') {
        matchesModel.getOwnFinished(function(matches){
            console.log('updateData finished matches', matches);
            tpl.cdata.finishedMatches.set(matches);
        });
    }
}

Template.TeamMatches.helpers({
    toggleMatches: toggleMatches,
    matches: getDisplayMatches,
    childDiplayOptions: childDiplayOptions,
    getTeam: getTeam
});

function toggleMatches() {
    var matchesDisplayed = Session.get('param-teamMatches');
    if (matchesDisplayed === 'unfinished') {
        return '<a href="/match-history">Match History</a>';
    } else if (matchesDisplayed === 'finished') {
        return '<a href="/matches">Current Matches</a>';
    }
}

function getDisplayMatches() {
    var matchesDisplayed = Session.get('param-teamMatches');
    if (matchesDisplayed === 'unfinished') {
        return getUnfinishedMatches();
    } else if (matchesDisplayed === 'finished') {
        return getFinishedMatches();
    }
}

function getFinishedMatches() {
    var tpl = Template.instance();
    return tpl.cdata.finishedMatches.get();
}

function getUnfinishedMatches() {
    var tpl = Template.instance();
    return tpl.cdata.unfinishedMatches.get();
}

function getTeam() {
    var tpl = Template.instance();
    return tpl.cdata.team.get();
}

function childDiplayOptions() {
    return {
        competitionName: true,
        ordersState: true
    }
}