Template.MatchSummary.helpers({
    'total': function(stat) {
        return this.ratings[stat].converted + this.ratings[stat].missed;
    },
    'percentage': function(stat) {
        var percentage = 0;
        percentage = (this.ratings[stat].converted/ (this.ratings[stat].converted + this.ratings[stat].missed)) * 100;
        if (isNaN(percentage)) percentage = 0;
        percentage = Math.round(percentage * 10) / 10;
        return percentage;
    }
});