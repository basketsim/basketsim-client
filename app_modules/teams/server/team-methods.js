import {Meteor} from 'meteor/meteor';
import teamDataModel from './models/team-datamodel.js';
import teamActions from './actions/team-actions.js';

Meteor.methods({
    'teams:getOwn': getOwn,
    'teams:getByID': getByID,
    'teams:getNameByID': getNameByID,
    'teams:actions:updateBans': teamActions.updateAllTransferBans
});

function getOwn() {
    return teamDataModel.getOwn(this.userId);
}
function getByID(teamID) {
    return teamDataModel.getByID(teamID, this.userId);
}

function getNameByID (team_id) {
    return Teams.findOne({_id: team_id}, {fields:{name:true}}).name;
}