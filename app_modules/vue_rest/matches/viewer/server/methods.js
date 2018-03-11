import { Meteor } from 'meteor/meteor';
import { getMatchLogs, getEmptyMatchStats, getPotential } from './controllers/logs';
import { createTestMatches } from './controllers/admin/create-test-matches';
import { changeDates } from "./controllers/admin/change-dates";
import { getMatches } from './controllers/matches';

Meteor.methods({
  'GET:matches/logs': getMatchLogs,
  'GET:matches/stats/empty': getEmptyMatchStats,
  'GET:matches/stats/potential': getPotential,
  'GET:matches': getMatches,
});

// Admin methods
Meteor.methods({
  'POST:admin/matches/test-matches': createTestMatches,
  'PUT:admin/matches/date': changeDates
});