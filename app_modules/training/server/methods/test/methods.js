//simply call the normal functions that are normally ran from crons to see how they work and if everything is right.
//also, go wild with these in case you want deeper tests that can be ran from the console in the future
import senior from './../../senior.js'
import youth from './../../youth.js'

Meteor.methods({
    trainAllYouth: function (training) {
        if (this.userId !== 'wg2H3Bem7BrERkEsZ') return;
        youth.trainAll();
    },
    executeTraining: function(player_id) {
        if (this.userId !== 'wg2H3Bem7BrERkEsZ') return;
        //once a training plan is created, run this to test it
    },
    passWeek: function(player_id, noOfWeeks) {
        if (this.userId !== 'wg2H3Bem7BrERkEsZ') return;
        var finishing;
        YouthTraining.update({}, {$inc:{remaining: -1}}, {multi:true});

        finishing = YouthTraining.find({remaining:0}).fetch();
        _.each(finishing, function(training){
            youth.train(training);
        });
    },
    trainSenior: function(player_id, skill, intensity) {
        if (this.userId !== 'wg2H3Bem7BrERkEsZ') return;
        var player = Players.findOne({_id: player_id});
        var team = Teams.findOne({_id: player.team_id});
        var coach = Players.findOne({team_id: team._id, coach:1});
        senior.train(player, skill, intensity, coach);
    },
    mockTrain: function(index, skill, intensity){
        var playerSummary = [
            {age: 17, wr: 80,avg: 60},
            {age: 18, wr: 80,avg: 60},
            {age: 19, wr: 80,avg: 60},
            {age: 20, wr: 80,avg: 60},
            {age: 21, wr: 80,avg: 60},
            {age: 22, wr: 80,avg: 60},
            {age: 23, wr: 80,avg: 60},
            {age: 24, wr: 80,avg: 60},
            {age: 26, wr: 80,avg: 60},
            {age: 27, wr: 80,avg: 60}
        ];
        var players = [
            {
                name: 'Name1',
                surname: 'Surname1',
                age: 17,
                handling: 60,
                passing: 60,
                rebounds: 60,
                freethrow: 60,
                shooting: 60,
                defense: 60,
                workrate: 80,
                dribbling: 60,
                positioning: 60,
                quickness: 60,
            }
        ];

        senior.train(players[index], skill, intensity, getCoach());
    },

    mockProgress: function(age, avg, wr) {
        getEvolution(age, avg, wr);
    }
});

function getEvolution(age, avg, wr) {
    var seed, progress, newAverage, newAge;
    newAge = age;
    newAverage = avg;
    while(newAge< 35) {
        seed = generateMock(newAge, newAverage, wr);
        progress = senior.train(seed, 'defense', 'immense', getCoach());
        newAverage = newAverage + (progress * 14) / 9;
        newAge = newAge + 1;
    }

}

function generateMock(age, avg, wr) {
    var skills = ['handling', 'quickness', 'passing', 'dribbling', 'rebounds', 'positioning', 'shooting', 'freethrow', 'defense'];
    var player = {
        name: 'Name1',
        surname: 'Surname1',
        age: age,
        workrate: wr*8
    };
    _.each(skills, function(skill){
        player[skill] = avg;
    });

    return player;
}

function getCoach() {
    var coach = {
        name: 'Adi',
        surname: 'Malta',
        motiv: '100',
        seniorAbility: 100,
        youthAbility: 90
    };
    return coach;
}