import playersModel from './models/players-clientmodel.js';
import teamModel from './../../teams/client/models/team-clientmodel.js';
import Bookmark from './containers/Bookmark';
import utils from './../../utils/client/api';
import {store, m} from './../../store/client/store';

var teamName = new ReactiveVar('');

Template.PlayerInfo.onCreated(function(){
    var self = this;
    this.employment = new ReactiveVar('');
    this.cdata = {
        team: new ReactiveVar(null),
        player: new ReactiveVar(null),
        players: new ReactiveVar([])
    }
    this.autorun(function() {
        let playerID = Session.get('param-playerID');
        if (playerID) {
            updateData(playerID, self);
            console.log('updated playerID');
            store.commit(m.players.SELECTED_ID, playerID);
        }
    });

    cbutils.events.on('player:update', function(){
        let playerID = Session.get('param-playerID');
        if (playerID) refreshData(playerID, self);
    });
})

Template.PlayerInfo.onRendered(function(){
    var player = getPlayer();
    utils.initComponent(Bookmark, '#test-vue');

    if (!player) return;
    Meteor.call('teamNameById', player.team_id, function (error, result) {
        teamName.set(result);
    });
});

Template.PlayerInfo.helpers({
    ownPlayer: ownPlayer,
    isOnSale: isOnSale,
    showPlayerSkills: showPlayerSkills,
    getTeamName: getTeamName,
    isSenior: isSenior,
    player: getPlayer,
    players: getPlayers,
    fullName: fullName
});

function updateData(playerID, tpl) {
    teamModel.getOwn(function(team){
        tpl.cdata.team.set(team);
    });
    playersModel.getByID(playerID, function(player){
        tpl.cdata.player.set(player);
        let playerType = player.coach;
        playersModel.getByTeamID(player.team_id, function(players){
            tpl.cdata.players.set(_.where(players, {coach:playerType}));
        });
    });
}

function refreshData(playerID, tpl) {
    playersModel.refreshByID(playerID, function(player){
        tpl.cdata.player.set(player);

        playersModel.refreshOwn(function(players){
            let playerType = player.coach;
            tpl.cdata.players.set(_.where(players, {coach:playerType}));
        });
    });
}

function getPlayer() {
    var tpl = Template.instance();
    return tpl.cdata.player.get();
}

function getTeam() {
    var tpl = Template.instance();
    return tpl.cdata.team.get();
}

function getPlayers() {
    var tpl = Template.instance();
    return tpl.cdata.players.get();
}

function fullName(player) {
    return player.name + ' ' + player.surname;
}

function isOnSale() {
    var player = getPlayer();
    if (player.transfer_id) {
        return true;
    } else {
        return false;
    }
}
function ownPlayer() {
    var team = getTeam();
    var player = getPlayer();
    if (!team || !player || !player.team_id) return false;
    if (player.team_id._str === team._id._str) {
        return true;
    } else {
        return false;
    }
}

function showPlayerSkills() {
    var own = ownPlayer();
    var player = getPlayer();
    if (!player) return false;
    if (own || player.transfer_id) {
        return true;
    } else {
        return false;
    }
}

function getTeamName() {
    return teamName.get();
}

function isSenior() {
    var player = getPlayer();
    if (player.coach === 0) return true;
    return false;
}