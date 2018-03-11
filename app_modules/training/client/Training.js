import playersModel from './../../players/client/models/players-clientmodel.js';
import teamsModel from './../../teams/client/models/team-clientmodel.js';

var skills= ['Handling', 'Quickness', 'Passing', 'Dribbling', 'Rebounds', 'Positioning',
            'Shooting', 'Freethrows', 'Defense'];
var intensities = ['Leisure', 'Normal', 'Intense', 'Immense'];
var denominations = ['none', 'pathetic', 'terrible', 'poor', 'below average', 'average', 'above average', 'good', 'very good', 'great', 'extremely great',
                    'fantastic', 'amazing', 'extraordinary', 'magnificent', 'phenomenal', 'sensational', 'miraculous', 'legendary', 'magical', 'perfect'];

Template.Training.onCreated(function(){
    var self = this;
    this.cdata = {
        coach: new ReactiveVar(null),
        team: new ReactiveVar(null)
    }

    playersModel.getOwn(function(players){
        self.cdata.coach.set(_.findWhere(players, {coach:1}))
    });
    teamsModel.getOwn(function(team){
        self.cdata.team.set(team);
    });

    cbutils.events.on('team:update', function(){
        teamsModel.refreshOwn(function(team){
            self.cdata.team.set(team);
        });
    });

    cbutils.events.on('player:update', function(){
        playersModel.refreshOwn(function(players){
            self.cdata.coach.set(_.findWhere(players, {coach:1}))
        });
    });

    if (this.data && this.data.refresh) {
        playersModel.refreshOwn(function(players){
            let coach = _.findWhere(players, {coach:1});
            self.cdata.coach.set(coach);
            Router.go('/training');
            setTimeout(function(){
                sAlert.success("You've succesfully hired " + cbutils.general.decodeHtml(coach.name + ' ' + coach.surname));
            }, 100);
        });
    }
});

Template.Training.events({
    'click .dropdown-menu li a': function(evt){
        evt.preventDefault();
        var category = $(evt.currentTarget).data('category'),
            group = $(evt.currentTarget).data('group'),
            item = $(evt.currentTarget).data('item');
        // $(evt.currentTarget).parent().parent().parent().find('button .name').text(category+ ': ' + this.toString());

        //update team by calling a method
        /*group - big men or small men*/
        /*category - intensity*/
        /*item - training*/
        Meteor.call('updateTraining', {
            group:group,
            category: category,
            item:item
        }, function(error, result){
            if (error) {
                sAlert.error('Training has not been set due to an error. Please try again or report the issue');
            } else {
                cbutils.events.fire('team:update');
                sAlert.success('New training has been set');
            }
        });
    },
    'click .fire-coach': function(event) {
        event.preventDefault();
        Modal.show('Modal', {
            modalName: 'Fire Coach',
            modalContentName: 'FirePlayer',
            player: getCoach()
        });
    },
    'click .renew-contract': function(event) {
        event.preventDefault();
        Modal.show('Modal', {
            modalName: 'Renew Coach Contract',
            modalContentName: 'RenewContractModal',
            coach: getCoach()
        });
    }
});

Template.Training.helpers({
    getSkills: function() {
        return skills;
    },
    getIntensities: function() {
        return intensities;
    },
    currentFocus: function(playerGroup){
        var team = getTeam();
        if (!team) return;
        return team.training[playerGroup].type;
    },
    currentIntensity: function(playerGroup) {
        var team = getTeam();
        if (!team) return;
        return team.training[playerGroup].intensity;
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
    },
    coach: getCoach
});

function getCoach() {
    var tpl = Template.instance();
    return tpl.cdata.coach.get();
}
function getTeam() {
    var tpl = Template.instance();
    return tpl.cdata.team.get();
}

function getValue(player, skill) {
    var value = parseInt(player[skill]/10);
    if (value > 20) {
        value = 20;
    }
    return value;
}