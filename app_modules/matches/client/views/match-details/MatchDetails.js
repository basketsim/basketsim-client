import matchesModel from './../../models/matches-clientmodel.js';

Template.MatchDetails.onCreated(function(){
    var self = this;
    this.cdata = {
        match: new ReactiveVar(null)
    }

    this.autorun(function(){
        var matchID = Session.get('param-matchDetails');
        updateData(self, matchID);
    });
});

Template.MatchDetails.helpers({
    match: getMatch,
    isState: isState,
    liveRedirect: liveRedirect
});

function updateData(tpl, matchID) {
    matchesModel.getByID(matchID, function(match){
        console.log('MatchDetails updateData match', match);
        tpl.cdata.match.set(match);
    });
}

function getMatch() {
    var tpl = Template.instance();
    return tpl.cdata.match.get();
}

function isState(match, state) {
    if (!match || !match.displayState) return false;

    if (match.displayState === state) return true;
    return false
}

function liveRedirect(match) {
    Meteor.call('updateLive', match._id, function(error){
        if (error) {
            sAlert.error(error.reason);
        } else {
            sAlert.success('Good choice! Match can be seen live!');
            Router.go('/live');
        }
    });
}
