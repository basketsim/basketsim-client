Meteor.methods({
    foulsAverage: foulsAverage
});

function foulsAverage (noMatches) {
    var matches = Matches.find({'state.simulated':true}, {fields: {'homeTeam.matchRatings.fouls':true, 'awayTeam.matchRatings.fouls':true}}).fetch();
    console.log(noMatches, matches.length);
    var values = [];
    _.each(matches, function(match){
        values.push(match.homeTeam.matchRatings.fouls);
        values.push(match.awayTeam.matchRatings.fouls);
    });
    var sum = _.reduce(values, function(all, num) {return all+num;});
    var avg = sum/values.length;
    console.log('total no fouls', avg);
}