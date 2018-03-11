import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';

import { MatchLogs } from "../../../../../../collections/collections";
import Matches from "../../../../../../collections/Matches";

function getMatchLogs(query) {
  var logs = null;

  if (query.debug) {
    try {
      logs = HTTP.call('GET', `http://localhost:8000/test/${query.matchID}`);
    } catch (e) {
      throw new Meteor.Error('Failure to call match server');
    }
  } else {
    // make a db call here
    console.log('else clause', query);
  }

  return logs;
}

function getEmptyMatchStats(query) {
  const stats = MatchLogs.findOne({match_id: query.find.match_id}, {stats: 1, attendance: 1});
  const sides = ['home', 'away'];
  const lineups = ['onCourt', 'subs'];
  if (!stats) return {};

  sides.forEach((side) => {
    stats.stats[side].stats = {};
    lineups.forEach((line) => {
      stats.stats[side].lineups[line].forEach((player) => {
        player.stats = {};
      });
    });
  });

  return stats;
}

function getPotential(query) {
  const match = Matches.findOne({_id: query.find.match_id}, {fields: {endDate: 1}});
  if (!match || !match.endDate || match.endDate.valueOf() > Date.now()) return null;

  const stats = MatchLogs.findOne({match_id: query.find.match_id}, {stats: 1}).stats;
  const sides = ['home', 'away'];
  const potential = {};

  if (!stats) return null;
  sides.forEach((side) => {
    potential[side] = {
      _id: stats[side]._id,
      name: stats[side].name,
      which: side,
      potential: stats[side].potential
    };
  });

  return potential;

}

export { getMatchLogs, getEmptyMatchStats, getPotential };