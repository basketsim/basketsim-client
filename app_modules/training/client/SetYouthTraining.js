import playersModel from './../../players/client/models/players-clientmodel.js';

var selectedSkillElement = '';
var selectedSkill = '';
var selectedSkillName = '';
var selectedWeekElement = '';
var selectedWeekInterval = 0;

Template.SetYouthTraining.onCreated(function(){
    var self = this;
    this.cdata = {
        coach: new ReactiveVar(null)
    }

    playersModel.getOwn(function(players){
        let coach = _.findWhere(players, {coach:1});
        self.cdata.coach.set(coach);
    });
});

Template.SetYouthTraining.helpers({
    skills: function () {
        var player = this.player;
        var list = ['handling', 'quickness', 'passing', 'dribbling', 'rebounds', 'positioning', 'shooting', 'freethrow', 'defense'];
        var names = ['Handling', 'Quickness', 'Passing', 'Dribbling', 'Rebounds', 'Positioning', 'Shooting', 'Freethrows', 'Defense'];
        var allSkills = [];

        _.each(list, function(skill, i){
            allSkills.push({
                name: names[i],
                skill: skill,
                value: getSkillValue(player[skill])
            })
        });

        return allSkills;
    },
    trainingWeeks: function() {
        var coach = getCoach();
        if (!coach) return 0;
        return coachWeeksRange(coach.experience);
    }
});

Template.SetYouthTraining.events({
    'click ul.skills > li': function(event, template){
        unsetActive(selectedSkillElement);
        setActive('skill', event.currentTarget);
        updateTitle(event.currentTarget, template);
    },
    'click li a': function(e) {
        e.preventDefault();
    },
    'click ul.weeks > li': function(event, template){
        unsetActive(selectedWeekElement);
        setActive('week', event.currentTarget);
        updateTitle(event.currentTarget, template);
    },
    'click .confirm-training': function() {
        Meteor.call('setYouthTraining', this.player._id, selectedSkill, selectedWeekInterval, function(error, result){
            if (error) {
                sAlert.error(error.reason);
            } else {
                sAlert.success('Training set succesfuly');
                cbutils.events.fire('player:update');
                Modal.hide('SetYouthTraining');
            }
        });
    }
});

Template.SetYouthTraining.helpers({
    canSetTraining: function() {
        return Template.instance().canSet.get();
    }
});

Template.SetYouthTraining.onCreated(function(){
    this.canSet = new ReactiveVar(false);
});

Template.SetYouthTraining.onDestroyed(function(){
    selectedSkillElement = '';
    selectedSkill = '';
    selectedSkillName = '';
    selectedWeekElement = '';
    selectedWeekInterval = 0;
    this.canSet.set(false);
});

function getCoach() {
    var tpl = Template.instance();
    return tpl.cdata.coach.get();
}

function coachWeeksRange(experience) {
    var range = [];
    var descriptions = {
        4:'Train the basics',
        5: 'Average level',
        6: 'Sustained effort',
        7: 'Complete training',
        8: 'Go extra'
    }
    var exp;
    if (!experience) {
        exp = 4;
    } else {
        exp = Math.round(experience)/11;
        exp = parseInt(exp);
    }

    if (exp > 8) exp = 8;
    if (exp < 4) exp = 4;
    for (var i=4; i<=exp; i++) {
        range.push({
            week: i,
            description: descriptions[i]
        });
    }
    return range;
}

function setActive(type, el) {
    if (type==='skill') {
        selectedSkillElement = el;
        selectedSkill = $(el).data('skill');
    }
    else if(type==='week') {
        selectedWeekElement = el;
        selectedWeekInterval = parseInt($(el).data('week'));
    }

    $(el).addClass('active');
    unsetActive()
}
function unsetActive(el) {
    if (el==='') return;
    $(el).removeClass('active');
}

function updateTitle(el, template) {
    var player = template.data.player;
    var text = '';
    var fullname = player.name + ' ' + player.surname;

    if ($(el).data('name')) {
        selectedSkillName = $(el).data('name');
    }
    if ($(el).data('week')) {
        selectedWeekInterval = $(el).data('week');
    }

    if (selectedSkillElement !== '') {
        text = fullname + ' will train ' + selectedSkillName;
    } else if (selectedWeekElement !== ''){
        text = fullname + ' will train for ' + selectedWeekInterval + ' weeks.';
    }

    if (selectedSkillElement !== '' && selectedWeekElement !== '') {
        text = fullname + ' will train ' + selectedSkillName + ' for ' + selectedWeekInterval + ' weeks.';
        template.canSet.set(true);
    }
    template.$('.youth-training-title').text(text);
}

function getSkillValue(val) {
    return parseInt(parseFloat(val)/8);
}