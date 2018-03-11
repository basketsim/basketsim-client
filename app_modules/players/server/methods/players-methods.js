import playersDataModel from './../models/players-datamodel.js';
import Players from './../../../../collections/Players';
import { Meteor } from 'meteor/meteor';

Meteor.methods({
    'players:getOwn': getOwn,
    'players:getByID': getByID,
    'players:getByTeamID': getByTeamID,
    'players:getNamesByIDList': getNamesByIDList
});

function getOwn() {
    return playersDataModel.getOwn(this.userId);
}

function getByID(playerID) {
    var oid = new Mongo.ObjectID(playerID);
    return playersDataModel.getByID(oid, this.userId);
}

function getByTeamID(teamID) {
    return playersDataModel.getByTeamID(teamID, this.userId);
}

function getNamesByIDList(playersID) {
    return playersDataModel.getNamesByIDList(playersID);
}