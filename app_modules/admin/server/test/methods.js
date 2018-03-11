import players from './../../../players/server/api.js';
import matches from './../../../matches/server/api.js';
import natcups from './../../../competitions/national-cup/server/api.js'

Meteor.methods({
    'admin:test:match': function(matchID) {
        if (!sbutils.validations.isAdmin(this.userId)) return;
        Meteor.call('geInit', Matches.findOne({_id: matchID}));
    },
    'admin:test:cup:runRoundRo':function() {
        if (!sbutils.validations.isAdmin(this.userId)) return;
        console.log('runRoundRo is starting');
        _runCupMatches('Romania');
        console.log('runRoundRo finished');

    },
    'admin:test:cup:runRoundAll': function() {
        if (!sbutils.validations.isAdmin(this.userId)) return;
        _runCupMatches();
    },
    'admin:test:updateMatches': function() {
        if (!sbutils.validations.isAdmin(this.userId)) return;
        console.log('updateMatches forced is starting');
        matches.updates.forceFinish();
        console.log('updateMatches forced finished');
    },
    'admin:test:cup:resetCupRo':function() {
        if (!sbutils.validations.isAdmin(this.userId)) return;
        console.log('resetCupRo is starting');
        var cup = NationalCups.findOne({country:'Romania'});
        NationalCups.remove({country:'Romania'});
        Matches.remove({'competition._id': cup._id});

        natcups.create.collection('Romania');

        natcups.create.season(NationalCups.findOne({country:'Romania'}));
        natcups.create.scheduleRound(NationalCups.findOne({country:'Romania'}));
        console.log('resetCupRo finished');
    }
});

function _runCupMatches(country) {
    var season = GameInfo.findOne().season;
    var cups = {};
    if (country) {
        cups = NationalCups.find({country:country}).fetch();
    } else {
        cups = NationalCups.find().fetch();
    }

    _.each(cups, function(cup){
        var nr = cup.seasons[season].state.nextRound;
        var roundMatches = cup.seasons[season].rounds[nr].matches;
        var matches = Matches.find({_id: {$in: roundMatches}}).fetch();
        _.each(matches, function(match, i){
            Meteor.call('geInit', match);
            console.log('simulated cup matches: ', i+1, '/', matches.length);
        });
    });
}