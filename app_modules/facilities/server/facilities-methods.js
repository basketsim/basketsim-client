import arenaDataModel from './models/arena-datamodel.js';
import arenaUpdatesModel from './models/arena-updates-model';
import {ArenaUpdates} from './../../../collections/collections';
import arenaActions from './actions/arena-actions';
import utils from './../../utils/server/api';
import {Meteor} from 'meteor/meteor';


Meteor.methods({
    'facilities:arena:getOwn': arenaGetOwn,
    'facilities:arena:getByTeamID': arenaGetByTeamID,
    'facilities:arena-updates:getByArenaID': getOngoingUpdatesByArenaID,
    'facilities:arena:upgrade': upgradeArena,
    'facilities:arena:cancelUpgrade': cancelUpgrade,
    'facilities:arena:completeConstruction': completeConstruction
});

function arenaGetOwn() {
    return arenaDataModel.getOwn(this.userId);
}

function arenaGetByTeamID(teamID) {
    return arenaDataModel.getByTeamID(teamID, this.userId);
}

function getOngoingUpdatesByArenaID(arenaID) {
    return ArenaUpdates.findOne({arena_id: arenaID, complete:false});
}

function upgradeArena(newSeats, buildOption) {
    return arenaActions.upgrade(newSeats, buildOption, this.userId);
}

function cancelUpgrade() {
    arenaActions.cancelUpgrade(this.userId);
}

function completeConstruction() {
    if (!utils.validations.isAdmin(this.userId)) throw new Meteor.Error('error', 'You cannot perform this action');
    arenaActions.finishConstruction();
}