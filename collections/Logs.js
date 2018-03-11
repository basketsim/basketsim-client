import {Mongo} from 'meteor/mongo';

var Logs = new Mongo.Collection('logs', {idGeneration: 'MONGO'});

export default Logs;