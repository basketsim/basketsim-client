import { isAdmin } from '../../../../../utils/server/utils';
import { Meteor } from 'meteor/meteor';
import creation from './../../../../../../matches/server/creation';
import Chance  from 'chance';
import moment from 'moment';
import teamDataModel from './../../../../../../teams/server/models/team-datamodel';
import {Mongo} from 'meteor/mongo';

function createTestMatches() {
  if (!isAdmin(this.userId)) throw new Meteor.Error(`${this.userId} does not have permission`);
  console.log('START: createTestMatches');
  const chance = new Chance();
  const times = [moment().add(1, 'day').hour(20).startOf('hour').valueOf(), moment().add(1, 'day').hour(21).startOf('hour').valueOf(),
    moment().add(1, 'day').hour(22).startOf('hour').valueOf()];

  var activeTeamIDs = teamDataModel.getActive({_id:1}).map(function (team) {
    return team._id;
  });
  activeTeamIDs = chance.shuffle(activeTeamIDs);
  var length = 0;
  var half = 0;
  var secondHalf = [];
  var remaining = null;

  if (length % 2 === 0) {
    length = activeTeamIDs.length;
    half = length / 2;
    secondHalf = activeTeamIDs.splice(half);
  } else {
    remaining = activeTeamIDs.pop();
    length = activeTeamIDs.length;
    half = length / 2;
    secondHalf = activeTeamIDs.splice(half);
  }

  const testAway = new Mongo.ObjectID('55cf113f1cc5f84ae63e4b00');

  activeTeamIDs.forEach((homeID, i) => {
    if (secondHalf[i]) creation.setMatch(homeID, secondHalf[i], null, null, chance.pickone(times), {collection: 'TestGE'});
    console.log(`DONE: ${i+1}/${half} createTestMatches`);
  });

  if (remaining) creation.setMatch(remaining, testAway, null, null, chance.pickone(times), {collection: 'TestGE'});
  console.log('FINISH: createTestMatches');
}

export { createTestMatches };