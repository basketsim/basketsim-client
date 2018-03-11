var skills= ['Handling', 'Quickness', 'Passing', 'Dribbling', 'Rebounds', 'Positioning',
            'Shooting', 'Freethrows', 'Defense', 'Workrate', 'Experience'];
var intensities = ['Leisure', 'Normal', 'Intense', 'Immense'];
var denominations = ['none', 'pathetic', 'terrible', 'poor', 'below average', 'average', 'above average', 'good', 'very good', 'great', 'extremely great',
                    'fantastic', 'amazing', 'extraordinary', 'magnificent', 'phenomenal', 'sensational', 'miraculous', 'legendary', 'magical', 'perfect'];

Template.TeamTactics.helpers({
    matchTeam: function() {
        var match = this.match;
        return match[this.which];
    },
    ratings: function(skill) {
        var match = this.match;
        var rtgNum = match[this.which].teamRatings[skill];
        var result = Math.round(parseFloat(rtgNum)/8);
        var rtg = denominations[result-1];
        return rtg;
    }
});