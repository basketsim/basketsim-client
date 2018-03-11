import { Meteor } from 'meteor/meteor';
import Logs from './../../../../collections/Logs.js';

Meteor.methods({
    'monitoring:getLogs': getLogs
});

/**
 * [getLogs description]
 * @return {[type]} [description]
 */
function getLogs() {
    return Logs.find({}, {sort:{createdAt:-1}}).fetch();
}