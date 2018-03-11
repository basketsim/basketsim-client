import coach from './coach-market.js';
import player from './transfer-market/player.js';
import transfer from './transfer-market/transfer.js';
import marketActivity from './transfer-market/market-activity.js';
import search from './transfer-market/search.js';
import monitorActions from './actions/monitor-actions.js';
import transfersModel from './models/transfers-model.js';
import flagsModel from './models/transfer-flag-model.js';
import { TransferFlags, TransfersArchive, Transfers } from './../../../collections/collections.js';
import transferActions from './actions/transfers-actions.js';
import transferPenaltyModel from './models/transfer-penalty-model.js';
import sbutils from './../../utils/server/api.js';
import _ from 'underscore';

import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

Meteor.methods({
    'hireCoach': coach.hire,
    'maintainCoachMarket': coach.maintain,
    'addPlayerToMarket': player.addToMarket,
    'cancel-transfer': player.cancelTransfer,
    'bid': transfer.bid,
    'insertAllMarketActivity': marketActivity.insertAll,
    'searchTransfers': search,
    'userFlagTransfer': transfer.userFlag,
    'markets:getTransfer': transfersModel.get,

    'markets:monitor:getTransferHistory': monitorActions.getTransferHistory,
    'markets:monitor:insertFlag': insertFlag,
    'markets:monitor:getFlags': flagsModel.getAll,
    'markets:monitor:getTransferFlagStatus': getTransferFlagStatus,
    'markets:monitor:updateFlagReason': updateFlagComment,

    'markets:admin:adjustPrice': adjustPrice,
    'markets:admin:stopTransfer': stopTransfer,
    'markets:admin:cancelTransfer': cancelTransfer,
    'markets:admin:applyPenalty': applyPenalty,
    'markets:admin:isBidderPenalised': transferPenaltyModel.isBidderPenalised,
    'market:admin:rateFlag': rateFlag,

    'market-activity:insertMissingEntries': insertMissingActivityEntries
});

function insertFlag(transferID) {
    flagsModel.insert(transferID, this.userId);
}

function adjustPrice(transferID, percentageOfPrice) {
    if (!sbutils.validations.isAdmin(this.userId)) throw new Meteor.Error('forbidden-access', 'You cannot perform this operation');
    if (!_.contains([0.3,0.4,0.5,0.6,0.7,0.8], percentageOfPrice)) throw new Meteor.Error('denied-value', 'The value is not allowed');
    const transfer = TransfersArchive.findOne({_id: transferID}, {fields:{price:1, seller_id:1}});
    if (!transfer) throw new Meteor.Error('404', 'No transfer found');

    transferActions.adjustPrice(transfer.price.end, percentageOfPrice, transferID, transfer.seller_id);
}

function cancelTransfer(transferID) {
    if (!sbutils.validations.isAdmin(this.userId)) throw new Meteor.Error('forbidden-access', 'You cannot perform this operation');
    const transfer = TransfersArchive.findOne({_id: transferID}, {fields:{price:1, seller_id:1, player_id:1, buyer_id:1}});
    if (!transfer) throw new Meteor.Error('404', 'No transfer found');

    transferActions.cancelTransfer(transfer);
}

function stopTransfer(transferID) {
    if (!sbutils.validations.isAdmin(this.userId)) throw new Meteor.Error('forbidden-access', 'You cannot perform this operation');
    const transfer = Transfers.findOne({_id: transferID}, {fields:{price:1, seller_id:1, player_id:1, buyer_id:1, player:1}});
    if (!transfer) throw new Meteor.Error('404', 'No transfer found');

    transferActions.stopTransfer(transfer);
}

function applyPenalty(teamID, penalty, penaltyText, transferID) {
    if (!_.contains(['warn', 'ban', 'lock'], penalty)) throw new Meteor.Error('404', 'Penalty not recognised');
    if (!penaltyText) throw new Meteor.Error('no-description', 'You have not written a reason for the penalty. The penalty description is mandatory');
    if (!teamID) throw new Meteor.Error('no-team-id', 'There was an issue with the team id sent. Please try again');
    if (!sbutils.validations.isAdmin(this.userId)) throw new Meteor.Error('forbidden-access', 'You cannot perform this operation');

    var transfer = TransfersArchive.findOne({_id: transferID});
    if (!transfer) transfer = Transfers.findOne({_id: transferID});
    const appliedPenalty = transferPenaltyModel.insert(teamID, penalty, penaltyText, transfer, this.userId);
}

function rateFlag(rating, flagID) {
    if (!_.contains(['fake', 'disagree', 'useful', 'great'], rating)) throw new Meteor.Error('404', 'Flag rating not recognised');
    if (!flagID) throw new Meteor.Error('404', 'Missing flag id');
    if (!sbutils.validations.isAdmin(this.userId)) throw new Meteor.Error('forbidden-access', 'You cannot perform this operation');

    const scores = {
        fake: -2,
        disagree: 0,
        useful: 1,
        great: 2
    };

    TransferFlags.update({_id: flagID}, {$set: {flag_score: scores[rating]}});
}

function updateFlagComment(transferIDStr, comment) {
    const userInfoID = Meteor.users.findOne({_id: this.userId}).userInfo_id;
    const transferID = new Mongo.ObjectID(transferIDStr);
    flagsModel.updateComment(transferID, comment, userInfoID);
}

function getTransferFlagStatus(transferID) {
    const flags = TransferFlags.find({transfer_id: new Mongo.ObjectID(transferID)});
    const userInfoID = Meteor.users.findOne({_id: this.userId}).userInfo_id;
    var flaggedByThisUser = false;

    flags.forEach((flag) => {
        if (flag.flagger_userinfo_id._str === userInfoID._str) flaggedByThisUser = true;
    });

    return {
        flaggedByThisUser: flaggedByThisUser,
        count: flags.count()
    };
}

function insertMissingActivityEntries() {
    if (!sbutils.validations.isAdmin(this.userId)) throw new Meteor.Error('forbidden-access', 'You cannot perform this operation');
    marketActivity.insertMissing();
}