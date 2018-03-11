var external = false;
var curRound = null;

Template.NewMatches.onRendered(function(){
    console.log('new matches rendered', this);
});

Template.NewMatches.helpers({
    getTime: function(timestamp) {
        return moment(timestamp).format('dddd, MMM Do YYYY, HH:mm');
    },
    hasTactics: function() {
        var match = Matches.findOne({_id: this._id});

        var team_id = Session.get('team')._id;
        var team = Session.get('team');
        var tacticsSet = true;
        var defaultOrders = false;

        if (match.awayTeam.id._str === team_id._str) {
            tacticsSet = match.awayTeam.tacticsSet;
        } else if (match.homeTeam.id._str === team_id._str){
            tacticsSet = match.homeTeam.tacticsSet;
        }

        if (!tacticsSet) {
            if (!team.tactics) {
                defaultOrders = false;
            } else {
                defaultOrders = true;
            }
        }

        if (match.state.simulated && !match.state.finished) {
            return 'Match is live';
        }
        else if (tacticsSet) {
            return 'Match Orders Set';
        } else if (defaultOrders){
            return 'Using Default Orders';
        } else {
            return 'No Match Orders';
        }
    },
    score: function() {
        console.log('New matches is called which should be killed');
        var match = Matches.findOne({_id: this._id});

        if (match.state.finished) {
            Meteor.call('getScore', match._id, function(err, result){
                score = result;
                Session.set('score-'+match._id, result);
            });
            return Session.get('score-'+match._id);
        }
        // return this.homeTeam.matchRatings.score + ' - ' + this.awayTeam.matchRatings.score;
    },
    noMatches: function(matches) {
        if (!matches[0]) return true;
        return false;
    },
    compLogo: function() {
        var comp = this.competition.collection;
        var logo = {
            img: '',
            background: ''
        };

        switch(comp) {
            case "NationalCups":
            logo = {
                img: "/resources/trophies/national-cup.png",
                background: '#005a8d'
            };
            break;

            // case "Leagues":
            // logo = {
            //     img: "/resources/trophies/silver-league.png",
            //     background: '#681a7e'
            // };
            // break;

            default:
            logo = {
                img: "/material/trophy-icon.png",
                background: ''
            };
            break;
        }

        return logo;
    }
});