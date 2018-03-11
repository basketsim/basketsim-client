import news from './../../news/server/api.js';

function youth() {
    var api = {setYouthTraining, trainAll, train, passWeek, getTrainingValue, _sendNews, _validMaxMinInterval, trainingWorkrate};

    var skills = ['handling', 'quickness', 'passing', 'dribbling', 'rebounds', 'positioning', 'shooting', 'freethrow', 'defense'];

    /**
     * These kind of methods would greatly benefit from automated testing, as different inputs can be validated
     */
    function setYouthTraining(player_id, skill, interval) {
        var team = Teams.getByUserid(this.userId);
        var player = Players.findOne({_id: player_id});
        var coach = Players.findOne({coach:1, team_id: team._id});
        var training = {};

        setYouthTrainingValidation(player_id, skill, interval, coach);

        if (!ownsPlayer(team, player)) throw new Meteor.Error("not-your-player", "Looks like this player is not in your squad");
        if (!canTrain(player._id)) throw new Meteor.Error("cannot-train", "The player is already training");

        training = {
            player_id: player._id,
            skill: skill,
            length: parseInt(interval),
            workrate: trainingWorkrate(player, coach, skill, interval),
            remaining: parseInt(interval),
            result: null
        };


        YouthTraining.insert(training, function(error, result){
            if (error) throw new Meteor.Error("train-insert-fail", "Failed to assign training. Please try again " + error);
        });
    }

    function trainAll() {
        var finishing;
        api.passWeek();

        finishing = YouthTraining.find({remaining:0}).fetch();
        _.each(finishing, function(training){
            api.train(training);
        });
    }

    /**
     * 1. Check if skill is in range
     * 2. Check if the interval trained matches the coach ability
     */
    function setYouthTrainingValidation(player_id, skill, interval, coach) {
        if (!_validSkill(skill)) throw new Meteor.Error("not-valid-skill", "You cannot train " + skill);
        if (!_validRange(interval, coach)) throw new Meteor.Error("not-in-range", "Your coach cannot train players for " + interval + " weeks");
        if (!_validMaxMinInterval(interval)) throw new Meteor.Error("interval-exceeded", "The training must be between 4 and 8 weeks");
    }

    function _validMaxMinInterval(interval) {
        if (interval > 8 || interval < 4) {
            return false;
        } else {
            return true;
        }
    }

    function _validSkill(skill) {
        var skills = ['handling', 'quickness', 'passing', 'dribbling', 'rebounds', 'positioning', 'shooting', 'defense', 'experience', 'workrate', 'freethrow'];
        if (!_.contains(skills, skill)) {
            return false;
        } else {
            return true;
        }
    }

    function _validRange(interval, coach) {
        var exp;
        if (!coach) return false;
        if (!coach.experience) {
            exp = 4;
        } else {
            exp = Math.round(parseFloat(coach.experience))/11;
            exp = parseInt(exp);
        }

        if (exp > 8) exp = 8;
        if (exp < 4) exp = 4;

        if (interval > exp) {
            return false;
        } else {
            return true;
        }
    }

    function coachWeeksRange(experience) {
        if (!experience) {
            return [4,5];
        }
        var range = [];
        var exp = parseFloat(experience)/11;
        exp = parseInt(exp);

        for (var i=4; i<=exp; i++) {
            range.push(i);
        }
        return range;
    }

    function ownsPlayer(team, player) {
        if (player.team_id._str === team._id._str) {
            return true;
        } else {
            return false;
        }
    }

    function canTrain(player_id) {
        var training = YouthTraining.find({player_id: player_id}).count();
        if (training === 0) {
            return true;
        } else {
            return false;
        }
    }

    function trainingWorkrate(player, coach, skill, interval) {
        if (!coach) {
            coach = {
                youthAbility: 10
            };
        }

        var intervalMultipliers = {
            4: 0.9,
            5: 1.05,
            6: 1.18,
            7: 1.30,
            8: 1.40
        };

        var wr = coach.youthAbility * rawRandomRange(0.60, 0.72) * intervalMultipliers[interval];

        wr = talentBasedInf(player, wr);

        return parseInt(wr);
    }

    function coachInfluence(coach) {
        var coachInf = {}
        if (!coach) {
            coachInf = {
                workrate: 0,
                experience: 3,
                youthTraining: 40,
                wwy: ''
            };
        } else {
            coachInf = {
                workrate: parseFloat(coach.workrate),
                experience: parseFloat(coach.experience),
                youthTraining: parseFloat(coach.quality),
                wwy: coach.wwy
            };
        }

        if (coachInf.experience> 121) coachInf.experience = 121;
        // coachInf.experience = coachInf.experience/11;

        return coachInf;
    }

    function talentBasedInf(player, wr) {
        var ratio = 0;
        if (player.quality < 36 || player.potential === 'somewhat talented') ratio = 0.15;
        if ((player.quality >=36 && player.quality<100) || player.potential === 'talented') ratio = 0.05;
        if (player.quality >= 100 || player.potential === 'very talented') ratio = 0;

        return wr + wr*ratio;
    }

    /**
     * Get training value sets it to the trained skill and returns it
     * @param  {[type]} training [description]
     * @return {[type]}          [description]
     */
    function train(training) {
        var value = api.getTrainingValue(training);
        var setter = {};
        setter[training.skill] = value;
        //should add value to player
        Players.update({_id: training.player_id}, {$set:setter}, function(err, result){
            if (!err) {
                YouthTraining.remove({_id: training._id});
            }
        });
        api._sendNews(training.player_id, training.skill, value);
        return value;
    }

    function _sendNews(player_id, skill, value) {
        var player = Players.findOne({_id: player_id});
        news.game.youthTrainingOccured(player.team_id, player_id, player.name, player.surname, skill, value);
    }


    /** run it from cron */
    function passWeek() {
        YouthTraining.update({}, {$inc:{remaining: -1}}, {multi:true});
    }

    /**
     * Returns the final value of training
     * Training depends mostly on wr and few other influencers, but length is not accounted for anymore
     */
    function getTrainingValue(training) {
        var player = Players.findOne(training.player_id);
        var skillSum = getSkillSum(player);
        var sumHandicap = skillSum/18;
        var rand = rawRandomRange(0.85, 1.15);

        var value = (training.workrate * rand) - sumHandicap;
        value = addInfluencers(player, training.skill, value);

        return Math.floor(value);

    }

    function addInfluencers(player, skill, value) {
        var influencers = {
            calm: {
                quickness: function(value){return value - 10;},
                shooting: function(value){return value + randomRange(6,7);}
            },
            aggressive: {
                rebounds: function(value){return value + randomRange(8,9);}
            },
            stable: {
                handling: function(value){return value + randomRange(8,9);},
                freethrow: function(value){return value + randomRange(8,9);}
            },
            entertaining: {
                entertaining: function(value){return value + randomRange(8,9);}
            },
            controversial: {
                positioning: function(value){return value - 12}
            },
            selfish: {
                passing: function(value){return value - 11},
                dribbling: function(value) {return value + randomRange(8,9);},
                shooting: function(value) {return value + randomRange(5,8);},
                defense: function(value) {return value - 11;}
            }
        };

        if (influencers[player.character] && influencers[player.character][skill]) {
            value = influencers[player.character][skill](value);
        }

        if (value < 19) value = randomRange(6,31);
        if (value > 90) value = 90;

        return value;
    }

    function getSkillSum(player) {
        var sum = 0;
        _.each(skills, function(skill){
            sum += parseFloat(player[skill]);
        });

        return sum;
    }

    function randomRange(min, max) {
        return Math.floor(Math.random() * (max - min) + min);
    }

    function rawRandomRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    return api;
}

export default youth();
