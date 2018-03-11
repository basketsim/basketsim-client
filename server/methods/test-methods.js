var chance = new Chance();
Meteor.methods({
    genTestMatches: genTestMatches,
    aspTestMatch: aspTestMatch,
    verEmail: function() {
        Accounts.sendVerificationEmail(this.userId);
    }
});

function genTestMatches (numOfMatches) {
    var teams = Teams.getActive();

    var pairs = parseInt(teams.length/2);
    teams = chance.shuffle(teams);
    var time = new Date();
    time = time.valueOf() + (5 * 60 * 1000); //schedule mathes 5 minute in the future

    var competitionInfo = {
        type: 'Test',
        arenaLocation: 'Home'
    };

    if (numOfMatches === 0) {
        numOfMatches = pairs;
    }

    for (var i=0; i< numOfMatches; i++) {
        CompUtils.setMatch(teams[i*2]._id, teams[i*2+1]._id, null, competitionInfo, null, null, time);
    }
}

function aspTestMatch() {
    var teams = Teams.getActive();
    var index = Math.round(Math.random()*(teams.length-1));
    var opp = teams[index];
    var asp = Teams.getByUserid(this.userId);

    console.log('asp test match', asp, opp);
    var competitionInfo = {
        type: 'Test',
        arenaLocation: 'Home'
    };

    var time = new Date();
    time = moment().add(100, 'minutes').valueOf();

    CompUtils.setMatch(asp._id, opp._id, null, competitionInfo, null, null, time);
}