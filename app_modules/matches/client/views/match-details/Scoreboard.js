Template.Scoreboard.events({
    'click .scoreboard .score p': function(e){
        e.preventDefault();
        var matchid = this.match._id;
        Meteor.call('updateLive', matchid);
        Router.go('live');
    },
    'click .scoreboard .score a': function(e) {
        e.preventDefault();
    }
});

Template.Scoreboard.helpers({
    score: function(){
        return {
            homeTeam: this.match.homeTeam.matchRatings.score,
            awayTeam: this.match.awayTeam.matchRatings.score
        };
    },
    commentaryActive: function() {
        if (this.match.matchHistory.archived) {
            return false;
        } else {
            return true;
        }
    }
});