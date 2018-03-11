var newItems = true;
var limit = 50;
var sub;
var canRequest = true;
var currentRound = 1;

Template.PheonixPlayoff.events({
    'click .round': function(evt){
        event.preventDefault();
        requestRoundMatches($(evt.currentTarget).data('round'));
    },
});
Template.PheonixPlayoff.helpers({
    rounds: function() {
        return [{name: 'Round 1', round:1},{name: 'Round 2', round:2},{name: 'Round 3', round:3},{name: 'Round 4', round:4},{name: 'Round 5', round:5},{name: 'Round 6', round:6},
        {name: 'Round 7', round:7},{name: 'Round 8', round:8},{name: 'Quarter-Finals', round:9},{name: 'Semi-Finals', round:10}, {name: 'Final', round:11}];
    },
    getCurrentRound: function() {
        return Session.get('currentRound');
    },
    getMatches: function() {
        var matches = Matches.find({'competition.collection': 'PheonixTrophy', 'competition.stage':'playoff', 'competition.round': Session.get('currentRound')}).fetch();
        var matches = composedMatches(matches);
        return matches;
    }
});
Template.PheonixPlayoff.onCreated(function(){
    Session.set('currentRound', currentRound);
});
Template.PheonixPlayoff.onRendered(function(){
    var el = this.$('.card-content');
    var row = this.$('.card-content > .row');

    el.scroll(function(){
        checkListEnd(el.scrollTop(), row.height()-el.height());
    });
});

Template.PheonixPlayoff.onDestroyed(function(){
    if (sub) sub.stop();
});

/** Possible tooling function here */
function composedMatches(matches) {
    var composed = [];
    var teams = ['homeTeam', 'awayTeam'];
    _.each(matches, function(match){
        _.each(teams, function(team){
            match[team].join = Teams.findOne({_id: match[team].id});
        });
        composed.push(match);
    });

    return composed;
}

function checkListEnd(scrollTop, height) {
    if (!canRequest) return;
    if (scrollTop > height - 300 && newItems) {
        newItems = false;
        requestNewMatches();
    }
}

function requestRoundMatches(round) {
    limit = 0;
    currentRound = round;
    Session.set('currentRound', round);
    requestNewMatches(round);
}

function requestNewMatches(round) {
    if (!round) round = 1;
    canRequest = false;
    limit = limit + 50;
    sub = Meteor.subscribe('phoenix-playoff', limit, Session.get('currentRound'), function(){
        newItems = true;
    });

    setTimeout(function() {
        canRequest = true;
    }, 300);
}

