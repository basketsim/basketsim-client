import matchModule from './../../../../matches/server/api.js'
function main(argument) {
    var api = {playSeason};

    function playSeason() {
        console.log('play season started');
        var matches = Matches.find({'competition._id': new Mongo.ObjectID("55cf04f11cc5f84ae61f0996")});
        var matchesCount = matches.count();
        matches.forEach(function (match, index) {
            Meteor.call('geInit', match);
            console.log('matches played', index+1, '/', matchesCount);
        });
        //after matches are played, call the matches update
        matchModule.updates.forceFinish();
        console.log('play season ended');

    }

    return api;
}

export default main();