var skills= ['Handling', 'Quickness', 'Passing', 'Dribbling', 'Rebounds', 'Positioning',
            'Shooting', 'Freethrows', 'Defense', 'Workrate', 'Experience'];
var intensities = ['Leisure', 'Normal', 'Intense', 'Immense'];
var denominations = ['none', 'pathetic', 'terrible', 'poor', 'below average', 'average', 'above average', 'good', 'very good', 'great', 'extremely great',
                    'fantastic', 'amazing', 'extraordinary', 'magnificent', 'phenomenal', 'sensational', 'miraculous', 'legendary', 'magical', 'perfect'];

Template.Coach.events({

});

Template.Coach.helpers({
    getMotivation: function() {
        if (this.motiv > 100) {
            return 100;
        } else {
            return parseInt(this.motiv);
        }
    },
    seniorAbility: function() {
        console.log('coach senior ability', this);
        var motivativation = this.motiv;
        var ratio = 1;
        if (motivativation > 100) motivativation = 100;
        ratio = motivativation/100;

        return Math.round(this.seniorAbility * ratio);
    },
    youthAbility: function() {
        console.log('coach youth ability', this);

        var motivativation = this.motiv;
        var ratio = 1;
        if (motivativation > 100) motivativation = 100;
        ratio = motivativation/100;

        return Math.round(this.youthAbility * ratio);
    },
    getSkillString: function (skill) {
        if (skill === 'fatigue') {
            return '';
        } else {
            return denominations[getValue(this, skill)];
        }
    },
    getSkillInt: function (skill) {
        return getValue(this, skill);
    }
});

function getValue(player, skill) {
    var value = parseInt(player[skill]/8);
    if (value > 20) {
        value = 20;
    }
    console.log(value);
    return value;
}