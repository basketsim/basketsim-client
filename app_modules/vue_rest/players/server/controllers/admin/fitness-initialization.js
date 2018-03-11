import { isAdmin } from '../../../../utils/server/utils';
import { Meteor } from 'meteor/meteor';
import Players from './../../../../../../collections/Players';

function fitnessInitialization() {
  if (!isAdmin(this.userId)) throw new Meteor.Error(`${this.userId} does not have permission`);
  var i = 0;

  console.log('STARTED: fitnessInitialization');
  // const cursor = Players.find({ energy: null }, {fields: {energy: 1, age: 1}});
  const cursor = Players.find({}, {fields: {energy: 1, age: 1}});

  cursor.forEach((player) => {
    var stamina = 0;
    if (player.age <= 28) stamina = 8 * 20;
    if (player.age === 29) stamina = 8 * 19;
    if (player.age === 30) stamina = 8 * 18;
    if (player.age === 31) stamina = 8 * 17;
    if (player.age === 32) stamina = 8 * 16;
    if (player.age === 33) stamina = 8 * 14;
    if (player.age === 34) stamina = 8 * 12;
    if (player.age === 35) stamina = 8 * 10;
    if (player.age === 36) stamina = 8 * 8;
    if (player.age === 37) stamina = 8 * 5;
    if (player.age >= 38) stamina = 8 * 2;

    if (!stamina) throw new Meteor.Error(`Age is not defined for player ${player._id._str}`);

    Players.update({_id: player._id}, {
      $set: {
        energy: stamina,
        stamina: stamina
      },
      $unset: {
        fatigue: ''
      }
    }, () => {
      i++;
      if (i === 1) console.log(`${i} players updated`);
      if (i % 10000 === 0) console.log(`${i} players updated`);
    });
  });
}

export { fitnessInitialization };