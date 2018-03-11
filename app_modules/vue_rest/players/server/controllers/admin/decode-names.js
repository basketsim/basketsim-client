import { isAdmin } from '../../../../utils/server/utils';
import { Meteor } from 'meteor/meteor';
import Players from './../../../../../../collections/Players';
import { Names, Surnames, Arenas, Bookmarks } from "../../../../../../collections/collections";
import Leagues from './../../../../../../collections/Leagues';
import Teams from './../../../../../../collections/Teams';

import he from 'he';

function decodeNames() {
  if (!isAdmin(this.userId)) throw new Meteor.Error(`${this.userId} does not have permission`);
  decodeNamesDb();
  decodeArenaNames();
  decodeBookmarkNames();
  decodeLeagueNames();
  decodeTeamNames();
  decodePlayerNames();
}

function decodeNamesDb() {
  console.log('STARTED: decode names collection');
  Names.find({}, {fields: {name: 1}}).forEach((doc) => {
    Names.update({_id: doc._id}, {$set: {
      old_name: doc.name,
      name: he.decode(doc.name)
    }}, () => {});
  });

  console.log('STARTED: decode surnames collection');
  Surnames.find({}, {fields: {surname: 1}}).forEach((doc) => {
    Surnames.update({_id: doc._id}, {$set: {
      old_surname: doc.surname,
      surname: he.decode(doc.surname)
    }}, () => {});
  });

  console.log('FINISHED: decode names and surnames collections');
}

function decodeArenaNames() {
  console.log('STARTED: decode arenanames');
  Arenas.find({}, {fields: {arenaname: 1}}).forEach((doc) => {
    Arenas.update({_id: doc._id}, {$set: {
      old_arenaname: doc.arenaname,
      arenaname: he.decode(doc.arenaname)
    }}, () => {});
  });
  console.log('ENDED: decode arenanames');
}

function decodeLeagueNames() {
  console.log('STARTED: decodeLeagueNames');
  Leagues.find({}, {fields: {name: 1}}).forEach((doc) => {
    Leagues.update({_id: doc._id}, {$set: {
      old_name: doc.name,
      name: he.decode(doc.name)
    }}, () => {});
  });
  console.log('ENDED: decodeLeagueNames');
}

function decodeTeamNames() {
  console.log('STARTED: decodeTeamNames');
  Teams.find({}, {fields: {name: 1, arena_name: 1}}).forEach((doc) => {
    Teams.update({_id: doc._id}, {$set: {
      old_arena_name: doc.arena_name,
      old_name: doc.name,
      arena_name: he.decode(doc.arena_name),
      name: he.decode(doc.name)
    }}, () => {});
  });
  console.log('ENDED: decodeTeamNames');
}

function decodeBookmarkNames() {
  console.log('STARTED: decodeBookmarkNames');
  Bookmarks.find({}, {fields: {playerName: 1}}).forEach((doc) => {
    Bookmarks.update({_id: doc._id}, {$set: {
      old_playerName: doc.playerName,
      playerName: he.decode(doc.playerName)
    }}, () => {});
  });
  console.log('ENDED: decodeBookmarkNames');
}

function decodePlayerNames() {
  var i = 0;

  console.log('STARTED: decodeNames');
  const cursor = Players.find({}, {fields: {name: 1, surname: 1}});

  cursor.forEach((player) => {
    Players.update({_id: player._id}, {$set: {
      old_name: player.name,
      old_surname: player.surname,
      name: he.decode(player.name),
      surname: he.decode(player.surname)
    }}, function () {
      i++;
      if (i === 1) console.log(`${i} players updated`);
      if (i % 10000 === 0) console.log(`${i} players updated`);
    });
  });

  console.log('ENDED: decodeNames');
}

function fullNames() {
  console.log('STARTED: fullNames', new Date());
  var i = 0;
  const cursor = Players.find({fullName: null}, {fields: {name: 1, surname: 1}});
  cursor.forEach((player) => {
    let fullName = player.name + ' ' + player.surname;
    Players.update({_id: player._id}, {$set: {fullName: fullName}}, function() {
      i++;
      if (i === 1) console.log(`${i} players updated`, new Date());
      if (i % 10000 === 0) console.log(`${i} players updated`);
    });
  });
  console.log('ENDED: fullNames');
}

export { decodeNames, fullNames };