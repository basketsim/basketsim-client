import {Meteor} from 'meteor/meteor';
import { simTestMatches } from "./testGE-controllers";

Meteor.methods({
  'POST:admin/sim-competition/TestGE': simTestMatches
});