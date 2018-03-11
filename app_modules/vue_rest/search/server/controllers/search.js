import Teams from './../../../../../collections/Teams';
import Players from './../../../../../collections/Players';
import UserInfo from './../../../../../collections/UserInfo';

import {Mongo} from 'meteor/mongo';

const LIMIT = 50;

function searchPlayers(query) {
  if (query.find.name.length > 24) return [];
  const name = escapeRegExp(query.find.name);
  let reg = new RegExp(name, 'i');

  const pipe = [
    { $match: {fullName: { $regex: reg } }},
    { $lookup: {
      from: 'teams',
      localField: 'team_id',
      foreignField: '_id',
      as: 'team'
    }},
    { $unwind: '$team' },
    { $project: {
      fullName: 1,
      country: 1,
      ev: 1,
      age: 1,
      ['team.name']: 1,
      ['team._id']: 1,
    }},
    { $limit: LIMIT }
  ];

  const players = Players.aggregate(pipe);

  const fixedId = players.map((player) => {
    player._id = new Mongo.ObjectID(player._id.toString());
    player.team._id = new Mongo.ObjectID(player.team._id.toString());
    return player;
  });

  return fixedId;
}

function searchUsers(query) {
  if (query.find.name.length > 24) return [];
  const name = escapeRegExp(query.find.name);
  let reg = new RegExp(name, 'i');
  let season = GameInfo.findOne().season;

  const pipe = [
    { $match: {username: { $regex: reg } }},
    { $lookup: {
      from: 'teams',
      localField: 'team_id',
      foreignField: '_id',
      as: 'team'
    }},
    { $unwind: '$team' },
    { $project: {
      username: 1,
      ['team.name']: 1,
      ['team.country']: 1,
      [`team.competitions.natLeague.seasons.${season}.name`]: 1
    }},
    { $limit: LIMIT }
  ];

  const userinfos = UserInfo.aggregate(pipe);
  const fixedId = userinfos.map((user) => {
    user._id = new Mongo.ObjectID(user._id.toString());
    return user;
  });
  return fixedId;
}

function searchTeams(query) {
  if (query.find.name.length > 24) return [];
  const name = escapeRegExp(query.find.name);
  let reg = new RegExp(name, 'i');
  let season = GameInfo.findOne().season;

  const pipe = [
    { $match: {name: { $regex: reg } }},
    { $lookup: {
      from: 'userinfo',
      localField: '_id',
      foreignField: 'team_id',
      as: 'userinfo'
    }},
    { $unwind: '$userinfo' },
    { $project: {
      name: 1,
      country: 1,
      [`competitions.natLeague.seasons.${season}.name`]: 1,
      ['userinfo.username']: 1
    }},
    { $limit: LIMIT }
  ];

  const teams = Teams.aggregate(pipe);
  const fixedIdTeams = teams.map((team) => {
    team._id = new Mongo.ObjectID(team._id.toString());
    return team;
  });
  return fixedIdTeams;
}

function escapeRegExp(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

export {searchPlayers, searchTeams, searchUsers};