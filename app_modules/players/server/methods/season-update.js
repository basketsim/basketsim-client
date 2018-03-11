import senior from './../senior.js';
import utils from './../utils.js';
import seasonUpdates from './../actions/season-updates';

import {Meteor} from 'meteor/meteor';
import {Mongo} from 'meteor/mongo';

var PlayersCheck = new Mongo.Collection('players_check', {idGeneration: 'MONGO'});
Meteor.methods({
    'players:season-updates:increaseAge': increaseAge,
    'players:season-updates:removeAgeUpdatedFlag': removeAgeUpdatedFlag,
    'players:season-updates:autopromoteYouth': autopromoteYouth,
    'players:season-updates:youthWageUpdate': youthWageUpdate,
    'players:season-updates:seniorWageUpdate': seniorWageUpdate,
    'players:season-updates:removeWageUpdatedFlag': removeWageUpdatedFlag
});

function increaseAge() {
    if (this.userId !== 'wg2H3Bem7BrERkEsZ') return;
    seasonUpdates.increaseAge();
}

function removeAgeUpdatedFlag() {
    if (this.userId !== 'wg2H3Bem7BrERkEsZ') return;
    seasonUpdates.removeAgeUpdatedFlag();
}

function autopromoteYouth() {
    if (this.userId !== 'wg2H3Bem7BrERkEsZ') return;
    seasonUpdates.autopromoteYouth();
}

function youthWageUpdate() {
    if (this.userId !== 'wg2H3Bem7BrERkEsZ') return;
    seasonUpdates.youthWageUpdate();
}

function seniorWageUpdate() {
    if (this.userId !== 'wg2H3Bem7BrERkEsZ') return;
    seasonUpdates.seniorWageUpdate();
}

function removeWageUpdatedFlag() {
    if (this.userId !== 'wg2H3Bem7BrERkEsZ') return;
    seasonUpdates.removeWageUpdatedFlag();
}