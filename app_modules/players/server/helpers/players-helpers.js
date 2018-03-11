import _ from 'underscore';

const playersHelpers = {
    wage
};

function wage(player) {
    var skills = ['handling', 'quickness', 'passing', 'dribbling', 'rebounds', 'positioning', 'shooting', 'freethrow', 'defense', 'experience', 'workrate'];
    var skillSum = 0;
    var skillValue = 1;
    var expDiff = 0;
    var starBonus = 1;
    _.each(skills, function(skill){
        skillValue = parseFloat(player[skill]) || 0;
        if (skill === 'experience') {
            if (skillValue > 160) {
                expDiff = skillValue - 160;
                skillValue = 160 + expDiff/2.2;
            }
            skillValue = skillValue * 1.5;
        }
        if (skill === 'workrate') skillValue = skillValue * 1.7;
        if (skill === 'defense') skillValue = skillValue * 1.4;


        skillSum = skillSum + skillValue;
    });

    starBonus = Math.pow(1.32, Math.sqrt(skillSum/8));
    skillSum = skillSum + Math.round(starBonus)*10;

    var wage = Math.pow(skillSum/8, 2.22);
    if (wage < 1000) wage = 1000;
    return Math.round(wage);
}

export default playersHelpers;