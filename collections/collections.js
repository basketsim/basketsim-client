import { Mongo } from 'meteor/mongo';

var GameText = new Mongo.Collection('game-text', {idGeneration: 'MONGO'}),
  FinanceLogs = new Mongo.Collection('finance-logs', {idGeneration: 'MONGO'}),
  UserInfoArchive = new Mongo.Collection('userinfo_archive', {idGeneration: 'MONGO'}),
  Transfers = new Mongo.Collection('transfers', {idGeneration: 'MONGO'}),
  TransfersArchive = new Mongo.Collection('transfers-archive', {idGeneration: 'MONGO'}),
  MarketActivity = new Mongo.Collection('market-activity', {idGeneration: 'MONGO'}),
  Events = new Mongo.Collection('events', {idGeneration: 'MONGO'}),
  AdminEvents = new Mongo.Collection('admin-events', {idGeneration: 'MONGO'}),
  TransferFlags = new Mongo.Collection('transfer_flags', {idGeneration: 'MONGO'}),
  TransferPenalties = new Mongo.Collection('transfer_penalties', {idGeneration: 'MONGO'}),
  Playoffs = new Mongo.Collection('playoffs', {idGeneration: 'MONGO'}),
  Competitions = new Mongo.Collection('competitions', {idGeneration: 'MONGO'}),
  ArenaUpdates = new Mongo.Collection('arena_updates', {idGeneration: 'MONGO'}),
  Arenas = new Mongo.Collection('arenas', {idGeneration: 'MONGO'}),
  MedicalCenter = new Mongo.Collection('medical_center', {idGeneration: 'MONGO'}),
  Bookmarks = new Mongo.Collection('bookmarks', {idGeneration: 'MONGO'}),
  MatchLogs = new Mongo.Collection('match_logs', {idGeneration: 'MONGO'}),
  LiveMatchLogs = new Mongo.Collection('live_match_logs', {idGeneration: 'MONGO'}),
  Names = new Mongo.Collection('names', {idGeneration: 'MONGO'}),
  Surnames = new Mongo.Collection('surnames', {idGeneration: 'MONGO'}),
  Transactions = new Mongo.Collection('transactions', {idGeneration: 'MONGO'});


/** Should get rid of these */
Arenas.getByUserid = function(userID, options) {
  var teamID = Teams.getByUserid(userID, {fields: {_id:1}})._id;
  return Arenas.findOne({team_id: teamID}, options);
}

global.Transfers = Transfers;
global.TransfersArchive = TransfersArchive;
global.MarketActivity = MarketActivity;
global.Events = Events;
global.AdminEvents = AdminEvents;
global.Competitions = Competitions;
global.Playoffs = Playoffs;
global.Arenas = Arenas;
global.MedicalCenter = MedicalCenter;
global.Names = Names;
global.Surnames = Surnames;
global.LiveMatchLogs = LiveMatchLogs;

/** Exporting */
export { GameText, FinanceLogs, Transfers, TransfersArchive, MarketActivity, UserInfoArchive, Events, AdminEvents,
  TransferFlags, TransferPenalties, Playoffs, Competitions, ArenaUpdates, Arenas, MedicalCenter, Bookmarks, MatchLogs,
  LiveMatchLogs, Names, Surnames, Transactions };