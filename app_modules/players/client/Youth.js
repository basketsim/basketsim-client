import teamModel from './../../teams/client/models/team-clientmodel.js';
import playersModel from './models/players-clientmodel.js';
import youthTrainingModel from './../../training/client/models/youthtraining-clientmodel.js';

Template.Youth.onCreated(function(){
    this.cdata = {
        players: new ReactiveVar([]),
        team: new ReactiveVar(null),
        youthTrainings: new ReactiveVar([])
    }

    updateData(this);
    refreshData(this);
});

Template.Youth.events({
    'click .dropdown-menu li a': function(evt){
        evt.preventDefault();
        var investment = $(evt.currentTarget).data('investment');
        if (investment === 50000) {
            sAlert.info('50000 investment is currently disabled. Please select another value');
            return;
        }
        Meteor.call('setInvestment', investment, function(error, success){
            if (error) {
                if (error.reason) {
                    sAlert.error(error.reason);
                } else {
                    sAlert.error('Unhandled error, please contact the administrator about this');
                }
            } else {
                sAlert.success('New investment set');
                cbutils.events.fire('team:update');
            }
        });
    },
    'click .add-to-academy': function(event) {
        event.preventDefault();
        Meteor.call('addToAcademy', function(error, success){
            if (error) {
                if (error.reason) {
                    sAlert.error(error.reason);
                } else {
                    sAlert.error('Unhandled error, please contact the administrator about this');
                }
            } else {
                sAlert.success('Youth player joined your academy');
                cbutils.events.fire('player:update');
            }
        });
    }
});

Template.Youth.helpers({
    currentInvestment: function(){
        var tpl = Template.instance();
        var team = tpl.cdata.team.get();
        if (!team) return;
        var invest = team.campinvest;
        var text = '';
        if (invest===0) text = 'No investment';
        if (invest===25000) text = 'Weekly: 25.000$';
        if (invest===50000) text = 'Weekly: 50.000$';
        return {
            value: invest,
            text: text
        }
    },
    players: function() {
        var tpl = Template.instance();
        return tpl.cdata.players.get();
    },
    getYouthTrainingList: getYouthTrainingList
});

function getYouthTrainingList() {
    var tpl = Template.instance();
    return tpl.cdata.youthTrainings;
}

function updateData(tpl) {
    playersModel.getOwn(function(players){
        players = _.where(players, {coach:9});
        tpl.cdata.players.set(players);

        let playerIDs = players.map(function(player){
            return player._id;
        });
        youthTrainingModel.getByPlayerIDList(playerIDs, function(youthTrainings){
            tpl.cdata.youthTrainings.set(youthTrainings);
        });
    });
    teamModel.getOwn(function(team){
        tpl.cdata.team.set(team);
    });
}

function refreshData(tpl) {
    cbutils.events.on('team:update', function(){
        teamModel.refreshOwn(function(team){
            tpl.cdata.team.set(team)
        });
    });
    cbutils.events.on('player:update', function(){
        playersModel.refreshOwn(function(players){
            players = _.where(players, {coach:9});
            tpl.cdata.players.set(players);

            let playerIDs = players.map(function(player){
                return player._id;
            });
            youthTrainingModel.refreshByPlayerIDList(playerIDs, function(youthTrainings){
                tpl.cdata.youthTrainings.set(youthTrainings);
            });
        });
    });
}