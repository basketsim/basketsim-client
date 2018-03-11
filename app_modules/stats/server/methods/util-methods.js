Meteor.methods({
    averageWeight: averageWeight,
    averageHeight: averageHeight,
    averageWagePerSkill: averageWagePerSkill,
    averageSkillAge: averageSkillAge,
    averageWealth: averageWealth
});

function averageHeight (age) {
    if (this.userId !== 'wg2H3Bem7BrERkEsZ') return;
    var players = Players.find({age:age}, {fields: {height: true}}).fetch();
    console.log('averageHeight players length', players.length);
    var sum = _.reduce(players, function(memo, player){ return memo + player.height; }, 0);
    var average = Math.round(sum/players.length);
    console.log('averageHeight', average);

    return average;
}

function averageWeight(age) {
    if (this.userId !== 'wg2H3Bem7BrERkEsZ') return;
    var players = Players.find({age:age}, {fields: {weight: true}}).fetch();
    var sum = _.reduce(players, function(memo, player){ return memo + parseFloat(player.weight);}, 0);
    var average = Math.round(sum/players.length);
    console.log('averageWeight', average, age);

    return average;
}

function averageWagePerSkill(min, max, limit) {
    if (this.userId !== 'wg2H3Bem7BrERkEsZ') return;
    if (!limit) limit = 10000;
    var teams = [];

    var activeTeams = Teams.getActive();
    _.each(activeTeams, function(team){
        teams.push(team._id);
    });
    var players = Players.find({team_id: {$in: teams}, age:{$gt:min, $lt:max}}, {limit:limit}).fetch();
    var averages = [];
    _.each(players, function(player){
        averages.push(wagePerSkill(player))
    });

    var totalSum = _.reduce(averages, function(memo, avg){ return memo + avg}, 0);
    var average = totalSum/averages.length;

    console.log('player average skill', average);

    return average;
}

function averageWealth() {
    if (this.userId !== 'wg2H3Bem7BrERkEsZ') return;
    if (!limit) limit = 10000;
    var teams = [];

    var activeTeams = Teams.getActive();
    _.each(activeTeams, function(team){
        teams.push(team.curmoney);
    });
    var wealth = _.reduce(teams, function(memo, money){ return memo + money}, 0);
    var average = wealth/teams.length;

    console.log('average wealth', average);

    return average;
}

function wagePerSkill(player) {
    var skillSum = 0;
    var skills = ['handling', 'quickness', 'passing', 'dribbling', 'rebounds', 'positioning', 'shooting', 'freethrow', 'defense', 'experience', 'workrate'];
    var wage = parseFloat(player.wage) || 0;
    _.each(skills, function(skill){
        skillSum = skillSum + parseFloat(player[skill]) || 0;
    });
    return Math.round(wage/skillSum);
}

function averageSkillAge(age) {
    if (this.userId !== 'wg2H3Bem7BrERkEsZ') return;
    var skills = ['handling', 'quickness', 'passing', 'dribbling', 'rebounds', 'positioning', 'shooting', 'freethrow', 'defense'];
    var skillSum = 0;
    var allSums = [];
    var totalSum = 0;
    var counter = 0;
    var teams = [];

    var activeTeams = Teams.getActive();
    _.each(activeTeams, function(team){
        teams.push(team._id);
    });
    var players = Players.find({team_id: {$in: teams}, age:age}).fetch();
    _.each(players, function(player){
        _.each(skills, function(skill){
            skillSum = skillSum + parseFloat(player[skill]);
        });
        allSums.push(skillSum);
        skillSum = 0;
        counter++;
    });
    console.log(allSums.length, counter);
    totalSum = _.reduce(allSums, function(memo, sum){ return memo + sum}, 0);
    var average = Math.round(totalSum/allSums.length);
    console.log('age '+age+':', Math.round((average/8/9)*100)/100);
    return average;

}