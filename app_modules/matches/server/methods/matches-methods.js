import matchesDataModel from './../models/matches-datamodel.js';
import matchesActions from './../models/matches-actions.js';
import matchesTestActions from './../actions/matches-test-actions.js';
import { Transactions, Arenas } from "../../../../collections/collections";
import news from './../../../news/server/api';
import sbutils from './../../../utils/server/api.js';
import { HTTP } from 'meteor/http';

import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import Matches from "../../../../collections/Matches";


Meteor.methods({
    'matches:getPlayedByTeamID': getPlayedByTeamID,
    'matches:getOwnUnfinished': getOwnUnfinished,
    'matches:getOwnFinished': getOwnFinished,
    'matches:getByID': getByID,
    'matches:submitTactics': submitTactics,
    'matches:submitDefaultTactics': submitDefaultTactics,

    'matches:t:createASPMatch': createASPTestMatch,
    'matches:t:playMatches': playTestMatches,
    'matches:t:deleteMatches': deleteTestMatches,
    'POST:matches/state/finished': finishPreviousMatches,
    'POST:matches/state/finished2': finishPreviousMatches2,
    'POST:matches/fans/return': returnFans,


});

function getPlayedByTeamID(teamID) {
    return matchesDataModel.getPlayedByTeamID(teamID, true);
}

function getOwnUnfinished() {
    return matchesDataModel.getOwnUnfinished(this.userId, true);
}

function getOwnFinished() {
    return matchesDataModel.getOwnFinished(this.userId, true);
}

function getByID(matchID) {
    return matchesDataModel.getByID(this.userId, matchID, true);
}

function submitTactics(matchID, tactics) {
    matchesActions.submitTactics(this.userId, matchID, tactics);
}

function submitDefaultTactics(tactics) {
    matchesActions.submitDefaultTactics(this.userId, tactics);
}

function createASPTestMatch(matchType) {
    // if (!sbutils.validations.isAdmin()) return;
    console.log('createASPTestMatch after admin check');
    matchesTestActions.createASPTestMatch(matchType);
}

function playTestMatches() {
    // if (!sbutils.validations.isAdmin()) return;
    matchesTestActions.playTestMatches();
}

function deleteTestMatches() {
    // if (!sbutils.validations.isAdmin()) return;
    matchesTestActions.deleteTestMatches();
}

function finishPreviousMatches() {
  let matches = Matches.find({'state.simulated': true, 'state.finished': false, endDate: {$lt: new Date()}}).fetch();

  finishMatch(matches, 0);
}

function finishPreviousMatches2() {
  // console.log('settings ' + Meteor.settings);
  // let matches = Matches.find({ 'state.finished': false, $or: [{'dateTime.date': '2017-12-24'}, {'dateTime.date': '2017-12-27'}] }, {fields: {_id: 1}}).fetch();
  //
  // finishMatch(matches, 0);
}

function finishMatch(matches, index) {
  if (index === matches.length) return;

  let match = matches[index];

  HTTP.call('GET', `${Meteor.settings.engine_service}/matches/${match._id}/state/finished`, (err, res) => {
    if (!err) {
      console.log(`finished ${index+1} / ${matches.length} matches`);
      finishMatch(matches, index+ 1);
    } else {
      console.log('gets into err', err);
      throw new Meteor.Error(err);
    }
  });
}

function returnFans() {
  console.log('return fans started');
  Transactions.find({}).forEach((transaction) => {
    transaction.operations.forEach((op) => {
      if (op.collection === 'arenas') {
        let update = JSON.parse(op.update);
        let fans = update.$inc.fans;
        let teamID = new Mongo.ObjectID(JSON.parse(op.doc_identifier).team_id);
        if (fans && fans < 0) {
          let inc = fans * -1;
          Arenas.update({team_id: teamID}, {$inc: {fans: inc}}, function () {
            news.game.fansReturn(teamID, inc);
          });
        }
      }
    });
  });
  console.log('return fans finished');

}
