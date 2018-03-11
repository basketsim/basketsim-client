import Players from './../../../../collections/Players';
import senior from './../senior.js';
import playersModel from './../models/players-model';
import playersHelpers from './../helpers/players-helpers';


import {Meteor} from 'meteor/meteor';
import mongojs from 'mongojs';
import _ from 'underscore';
/**
 * ALWAYS TEST THIS ON LOCAL FIRST
 * */
const seasonUpdates = {
    increaseAge, removeAgeUpdatedFlag, autopromoteYouth, youthWageUpdate, seniorWageUpdate, removeWageUpdatedFlag
};
/**
 * The connection will timeout, but the updates are being done
 * */
function increaseAge() {
    console.log('STARTED: Increase Age');
    const playersBatch = Players.rawCollection().initializeUnorderedBulkOp();
    const players = Players.find({age_updated: {$ne: true}}, {fields: {_id: 1}});
    players.forEach((player, i) => {
        playersBatch.find({_id: mongojs.ObjectId(player._id._str)}).updateOne({$inc: {age: 1}, $set: {age_updated: true}});
        if (i % 50000 === 0) console.log(`Process: Increase Age ${i}`);
    });

    console.log(`wages are ready to be updated`);
    playersBatch.execute(function (err) {
        console.log('err', err);
        console.log('ENDED: Increase Age');
    });
}

function removeAgeUpdatedFlag() {
    console.log('Started: Remove age_updated flag');

    const playersBatch = Players.rawCollection().initializeUnorderedBulkOp();
    const players = Players.find({age_updated: true}, {fields: {_id: 1}});
    const length = players.count();
    players.forEach((player, i) => {
        playersBatch.find({_id: mongojs.ObjectId(player._id._str)}).updateOne({$unset: {age_updated: ""}});
        if (i % 50000 === 0) console.log(`Process: Remove age_updated flag ${i}/${length}`);
    });

    console.log(`${length} wages are ready to be updated`);
    playersBatch.execute(function (err) {
        console.log('err', err);
        console.log('Ended: Remove age_updated flag');
    });
}

function autopromoteYouth() {
    console.log('STARTED: Promote Youngsters');
    var players;
    var count = Players.find({age:{$gt: 17}, coach:9}).count();
    var limit = 40000;
    var start = 0;

    while (count >= 0) {
        players = Players.find({age:{$gt: 17}, coach:9}, {limit:limit, skip:start}).fetch();
        _.each(players, function(player, index){
            senior.autoPromoteYouth(player._id);
            console.log('remaining', index, 'createSeniors', '/', players.length);
        });

        start = start + limit;
        count = count - limit;
    }
    console.log('ENDED: Promote Youngsters');
}

function youthWageUpdate() {
    console.log('Started: Youth Wage Update');
    const juniorWage= {
        14: 500,
        15: 1000,
        16: 2000,
        17: 4000
    };
    const playersBatch = Players.rawCollection().initializeUnorderedBulkOp();
    const players = Players.find({coach:9}, {age:1});
    const length = players.count();

    players.forEach((player, i) => {
        if (_.contains([14,15,16,17], player.age)) {
            playersBatch.find({_id: mongojs.ObjectId(player._id._str)}).updateOne({$set: {
                wage: juniorWage[player.age]
            }});
            if (i % 1000 === 0) console.log(`Process: Youth Wage ${i}/${length}`);
        } else {
            console.log(`ERROR: ${player._id._str} has an unexpected age: ${player.age}`);
        }
    });

    playersBatch.execute(function (err, res) {
        if (err) {
            console.log('err', err);
        } else {
            console.log('Ended: Youth Wage Update');
        }
    });
}

/**
 * Update the senior wages of all players that are in teams (including bot teams)
 */
function seniorWageUpdate() {
  console.log('Started: Senior Wage Update');
  const players = playersModel.fetchSkills({team_id: {$ne:null}, coach:0});
  var i = 0;
  players.forEach((player) => {
    let newWage = playersHelpers.wage(player);
    if (typeof newWage === 'number') {
      Players.update({_id: player._id}, {$set: {wage: newWage}}, () => {
        i++;
        if (i % 10000 === 0) console.log(`Process: Senior Wage ${i}`);
      });

    } else {
      console.log(`ERROR: ${player._id._str} has an unexpected wage: newWage`);
    }
  });
}
/**
 * Need to change this to have players.forEach and then batch update. The forEach mehod works best and does not trigger mongo errors
 * */
function removeWageUpdatedFlag() {
    console.log('Started: Remove wage_updated flag');

    const playersBatch = Players.rawCollection().initializeUnorderedBulkOp();
    const players = Players.find({wage_updated: true}, {fields: {_id: 1}});
    const length = players.count();
    players.forEach((player, i) => {
        playersBatch.find({_id: mongojs.ObjectId(player._id._str)}).updateOne({$unset: {wage_updated: ""}});
        if (i % 50000 === 0) console.log(`Process: Remove wage_updated flag ${i}/${length}`);
    });

    console.log(`${length} players are ready to be updated`);
    playersBatch.execute(function (err) {
        console.log('err', err);
        console.log('Ended: Remove wage_updated flag');
    });
}

export default seasonUpdates;