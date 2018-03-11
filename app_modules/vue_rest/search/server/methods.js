import {Meteor} from 'meteor/meteor';
import {searchUsers, searchTeams, searchPlayers} from "./controllers/search";

Meteor.methods({
  'GET:search/players': searchPlayers,
  'GET:search/teams': searchTeams,
  'GET:search/users': searchUsers
});