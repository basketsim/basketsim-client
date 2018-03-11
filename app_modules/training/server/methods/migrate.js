/**
 * One off migration for players that are currently training
 */
var skills = ['handling', 'quickness', 'passing', 'dribbling', 'rebounds', 'positioning', 'shooting', 'freethrow', 'defense'];
Meteor.methods({
    migrateYouthTraining: function () {
        if (this.userId !== 'wg2H3Bem7BrERkEsZ') return;
        var players = Players.find({age:{$lt:18}}, {fields: {price: true, motiv:true, workrate:true}}).fetch();
        _.each(players, function(player){
            if (player.motiv && player.motiv !== '0.0') {
                insertTraining(player);
            }
        });
    },
    migrateQuality: function() {
        if (this.userId !== 'wg2H3Bem7BrERkEsZ') return;
        var potential = 0;
        var players = Players.find({coach:9}, {quality: true}).fetch();
        _.each(players, function(player){
            potential = getPotential(player.quality);
            if (potential) Players.update({_id:player._id}, {$set:{
                potential: potential
            }});
        });
    },
    migrateCoachMarket: function() {
        if (this.userId !== 'wg2H3Bem7BrERkEsZ') return;
        console.log('migrateCoachMarket started');
        // setStandardTeamId();
        setCoachAbilities();
        console.log('migrateCoachMarket ended');
    }
});

function setStandardTeamId() {
    Players.update({team_id:0}, {$set:{team_id:null}}, {multi:true});
}

function setCoachAbilities() {
    var coaches = Players.find({coach:1}).fetch();
    var seniorAbility, youthAbility;
    _.each(coaches, function(coach, i){
        seniorAbility = getSeniorAbility(coach);
        youthAbility = getYouthAbility(coach);
        console.log('coaches migrated', i+1, '/', coaches.length);
        Players.update({_id:coach._id}, {$set:{seniorAbility: seniorAbility, youthAbility:youthAbility}});
    });
}

function getSeniorAbility(coach) {
    var wr = Math.round(coach.workrate);
    var ability = 0;

    if (wr>121) wr=121;

    ability = (wr*100) /121;
    return Math.round(ability);
}

function getYouthAbility(coach) {
    var wr = Math.round(coach.workrate);
    var experience = Math.round(coach.experience);
    var quality = Math.round(coach.quality);
    var ability = 0;

    ability = 100 * (wr/10 + experience/6 + 2*(quality-40)) / 68;

    return Math.round(ability);
}

function getPotential(quality) {
    if (!quality) return false;
    if (quality < 36 ) return "somewhat talented";
    if (quality >=36 && quality<100) return "talented";
    if (quality >= 100) return "very talented";
}

function insertTraining(player) {
    var training = {
        player_id: player._id,
        skill: skills[player.price - 1],
        length: null,
        workrate: player.workrate,
        remaining: parseInt(player.motiv),
        result: null
    };
    // console.log(training);
    YouthTraining.insert(training);
}