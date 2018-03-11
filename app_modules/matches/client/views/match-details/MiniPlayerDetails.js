import youthTrainingModel from './../../../../training/client/models/youthtraining-clientmodel.js';

var skills = ['handlig', 'passing', 'rebounds', 'shooting', 'defense', 'experience', 'quickness', 'dribbling', 'positioning', 'freethrow', 'workrate', 'fatigue'];

var denominations = ['none', 'pathetic', 'terrible', 'poor', 'below average', 'average', 'above average', 'good', 'very good', 'great', 'extremely great',
                    'fantastic', 'amazing', 'extraordinary', 'magnificent', 'phenomenal', 'sensational', 'miraculous', 'legendary', 'magical', 'perfect'];
var shortDenominations = ['none', 'pathetic', 'terrible', 'poor', 'bel. avg', 'average', 'abv. avg', 'good', 'v. good', 'great', 'ex. great',
                    'fantastic', 'amazing', 'extraord…', 'magnificent', 'phenom…', 'sensati…', 'miracul…', 'legendary', 'magical', 'perfect'];

Template.MiniPlayerDetails.onCreated(function(){
    var self = this;
    this.employment = new ReactiveVar('');
    this.cdata = {
        youthTraining: new ReactiveVar(null)
    }

    this.autorun(function(){
        let playerID = Session.get('param-playerID');
        updateData(self, self.data.player._id);
    });
});

Template.MiniPlayerDetails.onRendered(function(){
    setEmployment(this.data.player);
});

function updateData(tpl, playerID) {
    youthTrainingModel.getByPlayerID(playerID, function(yt){
        tpl.cdata.youthTraining.set(yt);
    });
}

function getYouthTraining() {
    var tpl = Template.instance();
    return tpl.cdata.youthTraining.get();
}

Template.MiniPlayerDetails.helpers({
    dotify: dotify,

    getSkillString: function (skill) {
        var usedDenominations = [];

        if (window.screen.availWidth < 480) {
            usedDenominations = shortDenominations;
        } else {
            usedDenominations = shortDenominations;
        }

        if (skill === 'fatigue') {
            return '';
        } else {
            return usedDenominations[getValue(this.player, skill)];
        }
    },
    getSkillName: function(skill) {
        var st = {
            'handling': 'han',
            'passing': 'pas',
            'rebounds': 'reb',
            'shooting': 'sho',
            'defense': 'Def',
            'experience': 'Exp',
            'quickness': 'Qui',
            'dribbling': 'Dri',
            'positioning': 'Pos',
            'freethrows': 'Ft',
            'Work rate': 'Wr',
            'tiredness': 'Trd'
        }
        if ($(window).width() < 890 && $(window).width()>=768) {
            return _capitalize(st[skill]);
        } else {
            return _capitalize(skill);
        }
    },
    getSkillInt: function (skill) {
        var value = 0;
        value = getValue(this.player, skill);
        return value;
    },
    hasTrainedColor: function(skill) {
        if (!this.player) return 'black';
        if (this.player.lastTrainedSkill === skill) {
            return '#07B307';
        } else {
            return 'black';
        }
    },
    talent: function() {
        if (this.player.coach!==9) return '';
        if (this.player.potential === 'somewhat talented') return "Considered to be somewhat talented.";
        if (this.player.potential === 'talented') return "Considered to be talented.";
        if (this.player.potential === 'very talented') return "Considered to be very talented"
    },
    isSenior: function() {
        if (this.player.coach===9) {
            return false;
        } else {
            return true;
        }
    },
    /*Use a publication instead. You also need wr, length and skill*/
    youthHasTraining: function() {
        if (getYouthTraining()) return true;
        return false;
    },
    currTraining: function() {
        var training = getYouthTraining();
        var skill = training.skill;
        if (skill === 'Freethrow') skill = 'Freethrows';
        return {
            skill: skill,
            weeks: training.remaining
        };
    },
    employmentInfo: function() {
        var template = Template.instance();
        if (template.employment.get() === '') {
            setEmployment(this.player);
        }
        return template.employment.get();
    },
    ownPlayer: function() {
        return ownPlayer(this.player);
    },
    getWeight: function() {
        return parseInt(this.player.weight * 10)/10;
    },
    capitalize: _capitalize
});

Template.MiniPlayerDetails.events({
    'click .set-training': function(event) {
        event.preventDefault();
        Modal.show('Modal', {
            modalName: 'Youth Training Plan',
            modalContentName: 'SetYouthTraining',
            player: this.player
        });
    },
    'click .promote': function(event){
        event.preventDefault();
        Modal.show('Modal', {
            modalName: 'Promote Youth',
            modalContentName: 'YouthPromotionModal',
            player: this.player
        });
    },
    'click .fire-senior, click .fire-junior': function(event) {
        event.preventDefault();
        Modal.show('Modal', {
            modalName: 'Fire Player',
            modalContentName: 'FirePlayer',
            player: this.player
        });
    }
});

function dotify(x) {
    if (!x) return '';
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return parts.join(".");
}

function setEmployment(player) {
    var template = Template.instance();
    template.employment.set("Salary: " + dotify(player.wage));
}

function _capitalize(string) {
    if (!string) return null;
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function ownPlayer(player) {
    if (!Session.get('team')) return false;
    var team_id = Session.get('team')._id._str;
    if (player.team_id._str === team_id) {
        return true;
    } else {
        return false;
    }
}

function getValue(player, skill) {
    var value = 0;
    if (!player) return 0;
    // if (player.lastTrainedSkill === skill) {
    //     value = twoDecs(player[skill]/8);
    // } else {
        value = parseInt(player[skill]/8);
    // }
    if (value > 20) {
        value = 20;
    }
    if (player[skill] === '0.0') {
        return 0;
    }
    return value;
}

function twoDecs(num) {
    return Math.round(num * 100) / 100;
}