import utils from './utils';
import ev from './ev';

function senior() {
    var api = {autoPromoteYouth, createSenior, promoteYouth, height};

    var chance = new Chance();
    var skills = ['handling', 'quickness', 'passing', 'dribbling', 'rebounds', 'positioning', 'shooting', 'freethrow', 'defense'];

    function promoteYouth(player_id) {
        var team = Teams.getByUserid(this.userId);
        var player = Players.findOne({_id: player_id});

        if (!ownsPlayer(team, player)) throw new Meteor.Error("not-your-player", "Looks like this player is not in your squad");
        if (!canPromote(player)) throw new Meteor.Error("cannot-promote", "The player is not old enough to be promoted");
        player = assignMissingSkills(player);
        player.coach = 0;
        player.wage = utils.wage(player);
        player.workrate = player.quality; //and there is no quality for new players, only potential

        Players.update({_id: player_id}, player, function(error, succ){
            if (error) {
                throw new Meteor.Error("promote-failed", "There have been a connection error. Please try again");
            } else {
                YouthTraining.remove({player_id: player_id});
                ev.updateOne(player_id);
            }
        });
    }

    function autoPromoteYouth(player_id) {
        var player = Players.findOne({_id: player_id});

        player = assignMissingSkills(player);
        player.coach = 0;
        player.wage = utils.wage(player);
        player.workrate = player.quality;

        Players.update({_id: player_id}, player, function(error, succ){
            if (error) {
                throw new Meteor.Error("promote-failed", "There have been a connection error. Please try again");
            } else {
                YouthTraining.remove({player_id: player_id});
                ev.updateOne(player_id);
            }
        });

    }

    function ownsPlayer(team, player) {
        if (player.team_id._str === team._id._str) {
            return true;
        } else {
            return false;
        }
    }

    function canPromote(player) {
        if (player.age >= 16) return true;
        return false;
    }

    function assignMissingSkills(player) {
        _.each(skills, function(skill){
            if (player[skill] === '0.0' || player[skill] === 0) {
                player[skill] = chance.weighted([1,2,3,4,5,6], [10,20,25,20,15,10]) * 8;
            }
        });

        return player;
    }

    /* Senior for new teams*/

    function createSenior(country, team_id, position) {
        var pos = position || chance.pick(['PG', 'SG', 'SF', 'PF', 'C']);
        var p = {
            name: utils.name(country),
            surname: utils.surname(country),
            age: getAge(),
            team_id: team_id,
            country: country,
            character: utils.character(),
            height: height(pos),
            weight: 0,
            handling: 0,
            passing: 0,
            rebounds: 0,
            freethrow: 0,
            shooting: 0,
            defense: 0,
            workrate: Math.round(utils.normalMinMax(8,160, 74)),
            experience: 0,
            dribbling: 0,
            positioning: 0,
            quickness: 0,
            isonsale: 0,
            coach: 0,
            quality: 0, //hidden value
            potential: '', //this the exposed value, represented as string
            type: 'senior',
            price: 0,
            motivation: 0,
            hasPlayed: false,
            lastTraining: 0.0,
            lastPosition: '',
            looks: utils.looks(),
            injury: 0.0,
            ntplayer: false,
            shirt: null,
            ntshirt: null,
            statement: ''
        };
        p = makeSkills(p, pos);
        p.weight = utils.weight(p.height);
        p.experience = experience(p.age);
        p.wage = utils.wage(p);
        p.energy = getStamina(p.age);
        p.stamina = getStamina(p.age);
        p.fullName = p.name + ' ' + p.surname;
        return p;
    }

    function getStamina(age) {
      var stamina = 0;
      if (age <= 28) stamina = 8 * 20;
      if (age === 29) stamina = 8 * 19;
      if (age === 30) stamina = 8 * 18;
      if (age === 31) stamina = 8 * 17;
      if (age === 32) stamina = 8 * 16;
      if (age === 33) stamina = 8 * 14;
      if (age === 34) stamina = 8 * 12;
      if (age === 35) stamina = 8 * 10;
      if (age === 36) stamina = 8 * 8;
      if (age === 37) stamina = 8 * 5;
      if (age >= 38) stamina = 8 * 2;

      return stamina;
    }

    function skillAverageByAge(age) {
        var averages = {
            18:7.6*8, 19:7.85*8, 20:8.31*8, 21:8.72*8, 22:8.97*8, 23:9.5*8, 24:9.56*8, 25: 9.56*8,
            26: 9.92*8, 27: 10.03*8, 28: 10.36*8, 29: 10.65*8, 30: 10.19*8, 31: 9.94*8, 32: 9.63*8
        };
        return averages[age];
    }

    function getAge() {
        return Math.round(utils.normalMinMax(18,32));
    }

    function height(pos) {
        switch(pos) {
            case 'PG': return Math.round(utils.normalMinMax(175,200));
            case 'SG': return Math.round(utils.normalMinMax(180,205));
            case 'SF': return Math.round(utils.normalMinMax(190,210));
            case 'PF': return Math.round(utils.normalMinMax(195,220));
            case 'C': return Math.round(utils.normalMinMax(200,225));
        }
    }

    function makeSkills(p, pos) {
        var averageSkill = skillAverageByAge(p.age);
        var modifiers = positionModifiers(pos);
        var sum = 0;
        _.each(skills, function(skill){
            p[skill] = getSkill(skill, averageSkill, modifiers);
            sum = sum + p[skill];
        });
        return p;
    }

    function getSkill(skill, averageSkill, modifiers) {
        var handicap = utils.randomRange(-0.35, -0.18);
        var final = 0;

        final = averageSkill + (averageSkill*handicap);
        final = final + final* (modifiers[skill]||0);
        return Math.round(final);
    }

    function experience(age) {
        var min = {
            age: 18,
            exp: 0
        };
        var max = {
            age: 32,
            exp: 7
        };

        var expPerYear = (max.exp - min.exp)/(max.age-min.age);
        var rand = Math.round(utils.randomRange(-1.5, 1.5)*100)/100;

        var years = age - min.age;
        var experience = years * expPerYear + rand;
        if (experience<0) experience = 0;

        return Math.round(experience*8);
    }

    function positionModifiers(pos) {
        switch (pos) {
            case 'PG':
            return {
                handling: 0.2,
                quickness: 0.2,
                passing: 0.2,
                rebounds: -0.4,
                positioning: -0.2
            };
            case 'SG':
            return {
                shooting: 0.2,
                positioning: 0.2,
                dribbling: 0.2,
                rebounds: -0.4,
                defense: -0.2
            };
            case 'SF':
            return {

            };
            case 'PF':
            return {
                shooting: -0.2,
                handling: -0.2,
                rebounds: 0.4
            };
            case 'C':
            return {
                shooting: -0.2,
                handling: -0.2,
                quickness: -0.2,
                rebounds: 0.4,
                positioning: 0.2
            };
        }
    }

    return api;
}

export default senior();


