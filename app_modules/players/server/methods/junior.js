import utils from './../utils';
import news from './../../../news/server/api.js';
import financeModel from '../../../finances/server/models/finance-model.js';
var chance = new Chance();

Meteor.methods({
    addToAcademy: addToAcademy,
    setInvestment: setInvestment
});

/*Add the necessary restrictions - like do it once a week, only if investing and only to the logged team*/
function addToAcademy () {
    var team = Teams.getByUserid(this.userId);

    if (team.campinvest === 0) throw new Meteor.Error("need-to-invest", "You need to invest in your Youth School before promoting a new player");
    if (!team.canPullYouth) throw new Meteor.Error("already-pulled", "You have already pulled a player this week");
    if (maxYouthReached(team)) throw new Meteor.Error("too-many-players", "You already have 12 players in the youth squad. Fire or promote some");

    var p = createJunior(team.country, team.campinvest, team._id);
    Players.insert(p, function(err, id){
        if (err) {
            throw new Meteor.Error("pull-failed", "There have been a connection error. Please try again");
        } else {
            Teams.update({_id:team._id}, {$inc: {curmoney: -25000, tempmoney: -25000} ,$set:{canPullYouth: false}});
            financeModel.logAddYouth(team._id, 25000);
            news.game.youthAdded(team._id, id, p.name, p.surname);
        }
    });
}

function setInvestment(val) {
    Match.test(val, Match.Integer);
    var team = Teams.getByUserid(this.userId);
    if (val === 0 || val === 25000 || val === 50000) {
        Teams.update({_id: team._id}, {$set:{campinvest: val}}, function(error, succ){
            if (error) {
                throw new Meteor.Error("invest-failed", "There have been a connection error. Please try again");
            }
        });
    } else {
        throw new Meteor.Error("value-rejected", "The current investment is not accepted");
    }

}

function maxYouthReached(team) {
    var count = Players.find({team_id: team._id, coach:9}).count();
    if (count >= 12) return true;
    return false;
}

/**
 * Create junior player
 */
function createJunior(country, investition, team_id, test) {
    var p = {
        name: utils.name(country),
        surname: utils.surname(country),
        age: age(),
        team_id: team_id,
        country: country,
        character: utils.character(),
        height: 0,
        weight: 0,
        handling: 0,
        passing: 0,
        rebounds: 0,
        freethrow: 0,
        shooting: 0,
        defense: 0,
        workrate: 0,
        experience: 0,
        dribbling: 0,
        positioning: 0,
        quickness: 0,
        energy: 160,
        stamina: 160,
        isonsale: 0,
        coach: 9,
        quality: Math.round(normalMinMax(8,160, 74)), //hidden value
        potential: '', //this the exposed value, represented as string
        type: 'youth',
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
    p.wage = wage(p.age);
    p.height = utils.height(p.age);
    p.weight = utils.weight(p.height);
    p.potential = potential(p.quality);
    p.fullName = p.name + ' ' + p.surname;
    if (test) p.test=true;
    return p;
}



/*14 or 15 yo youth - 14 chances*/
function age() {
    return chance.weighted([14, 15], [25, 75]);
}

function wage(age) {
    switch(age) {
        case 14:
        return 500;
        case 15:
        return 1000;
    }
}

function potential(quality) {
    var fuzzyQuality = quality + quality* randomRange(-0.2, 0.2); //maybe use a scout for this
    if (fuzzyQuality < 56) return "somewhat talented";
    if (fuzzyQuality >=56 && fuzzyQuality<112) return "talented";
    if (fuzzyQuality >= 112) return "very talented"
}

function normal(mean, dev) {
    return chance.normal({mean:mean, dev:dev});
}
/**
 * http://jsfiddle.net/bsz1crr9/
*/
function normalMinMax(min,max, avg, devRatio) {
    var mean, dev, normalVal;

    if (avg) {
        mean = avg;
    } else {
        mean = (min + max) / 2;
    }

    if (devRatio) {
        dev = devRatio;
    } else {
        dev = (max - mean) / 3.2;
    }

    normalVal = chance.normal({mean:mean, dev:dev});

    if (normalVal > max) normalVal = max;
    if (normalVal < min) normalVal = min;
    return normalVal;
}


function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}