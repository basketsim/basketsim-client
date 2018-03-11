import {Meteor} from 'meteor/meteor';
import { fitnessInitialization } from './controllers/admin/fitness-initialization';
import { decodeNames, fullNames } from './controllers/admin/decode-names';

Meteor.methods({
  'PUT:admin/players/fitness': fitnessInitialization,
  'PUT:admin/players/names': decodeNames,
  'PUT:admin/players/fullNames': fullNames
});