import { TransfersArchive } from './../../../../collections/collections.js';
import ev from './../../../players/server/ev.js';
import { Meteor } from 'meteor/meteor';

import { Mongo } from 'meteor/mongo';
import mongodb from 'mongodb';

function monitorActions() {
    var api = { getTransferHistory };

    /**
     * Returns a number of transfers from the transfer history based on the options passed.
     * @param options {Object}. Contains {playerID, teamID}
     * @param limit {Integer}
     * @param skip {Integer}
     * @returns {{transfers: (*|null|AggregationCursor), max}}
     */
    function getTransferHistory(options, limit, skip) {
        var max = countAllTransfers(options);
        var matchingRules = getMatchingRules(options);

        var pipeBody = constructQuery(skip, limit);
        var pipe = matchingRules.concat(pipeBody);
        var transfers = TransfersArchive.aggregate(pipe);

        formatTransfersForClient(transfers);

        return {
            transfers: transfers,
            max: max
        };
    }

    function getMatchingRules(options) {
        var rules = [];
        if (options.transferID) {
            rules.push({ $match: { _id: mongodb.ObjectId(options.transferID)}});
        }
        if (options.playerID) {
            rules.push({ $match: { player_id: mongodb.ObjectId(options.playerID) }});
        }
        if (options.teamID) {
            rules.push({ $match: { $or: [{ buyer_id: mongodb.ObjectId(options.teamID)}, {seller_id: mongodb.ObjectId(options.teamID) }]}});
        }
        if (options.date) {
            rules.push({ $match: { 'timestamps.ended': {$gte: options.date }}});
        }
        if (!isNaN(options.minPrice) && !isNaN(options.maxPrice) && options.minPrice === options.maxPrice) {
            rules.push({ $match: {'price.end': options.minPrice }});
        } else {
            if (!isNaN(options.minPrice)) rules.push({ $match: {'price.end': {$gte: options.minPrice }}});
            if (!isNaN(options.maxPrice)) rules.push({ $match: {'price.end': {$lte: options.maxPrice }}});
        }

        return rules;
    }

    function countAllTransfers(options) {
        var filter = { buyer_id: { $ne: null }};
        if (options.transferID) filter._id = Meteor.Collection.ObjectID(options.transferID);
        if (options.playerID) filter.player_id = Meteor.Collection.ObjectID(options.playerID);
        if (options.teamID) filter.$or = [{ buyer_id: Meteor.Collection.ObjectID(options.teamID)}, {seller_id: Meteor.Collection.ObjectID(options.teamID) }];
        if (options.date) filter['timestamps.ended'] = { $gte: options.date };
        if (!isNaN(options.minPrice) && !isNaN(options.maxPrice) && options.minPrice === options.maxPrice) {
            filter['price.end'] = options.minPrice;
        } else {
            if (!isNaN(options.minPrice)) filter['price.end']= {$gte: options.minPrice };
            if (!isNaN(options.maxPrice)) filter['price.end']= {$lte: options.maxPrice };
        }

        return TransfersArchive.find(filter, { sort: { 'timestamps.ended': -1 }}).count();
    }

    function constructQuery(skip, limit) {
        var pipeBody = [
            { $sort: { 'timestamps.ended': -1 }},
            { $skip: skip },
            { $limit: limit },
            { $match: { 'penalty.transferReverted':false }},
            { $lookup: {
                from: 'teams',
                localField: 'seller_id',
                foreignField: '_id',
                as: 'sellerTeam'
            }},
            { $lookup: {
                from: 'teams',
                localField: 'buyer_id',
                foreignField: '_id',
                as: 'buyerTeam'
            }},
            { $unwind: '$sellerTeam' },
            { $unwind: '$buyerTeam' },
            { $project: {
                buyer_name: '$buyerTeam.name', //i want seller name and buyer name because i don't want teams to change name and affect investigations
                buyer_id:1,
                seller_name: '$sellerTeam.name',
                seller_id:1,
                player: 1,
                player_id: 1,
                bids: 1,
                flags: 1,
                state: 1,
                price: 1,
                timestamps: 1,
                penalty: 1
            }}
        ];

        return pipeBody;
    }

    function formatTransfersForClient(transfers) {
        transfers.forEach(function (transfer) {
            let playerEV = ev.getEV(transfer.player);
            let playerName = transfer.player.name + ' ' + transfer.player.surname;
            let age = transfer.player.age;
            let wr = Math.floor(transfer.player.workrate/8);
            let exp = Math.floor(transfer.player.experience/8);
            let ts = _ts(transfer.player);

            transfer._id = new Mongo.ObjectID(transfer._id.toString());
            transfer.player_id = new Mongo.ObjectID(transfer.player_id.toString());
            transfer.buyer_id = new Mongo.ObjectID(transfer.buyer_id.toString());
            transfer.seller_id = new Mongo.ObjectID(transfer.seller_id.toString());

            transfer.player = {};
            transfer.player.name = playerName;
            transfer.player.ev = playerEV;
            transfer.player.age = age;
            transfer.player.workrate = wr;
            transfer.player.experience = exp;
            transfer.player.ts = ts;
            
            transfer.bids.forEach(function (bid) {
                bid.bidder_id = new Mongo.ObjectID(bid.bidder_id.toString());
            });
        });
    }

    function _ts(player) {
        var skills = ['handling', 'quickness', 'passing', 'dribbling', 'rebounds', 'positioning', 'shooting', 'defense', 'experience', 'workrate', 'freethrow'];
        var sum = 0;
        skills.forEach(function (skill) {
            player[skill] = Math.floor(player[skill]/8);
            if (skill !== 'workrate' && skill !== 'experience') sum = sum + player[skill];
        });

        return sum;
    }

    return api;
}

export default monitorActions();

