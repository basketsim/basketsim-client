import senior from './../senior.js';
import coach from './../coach.js';

Meteor.methods({
    promoteYouth: senior.promoteYouth,
    createSenior: senior.createSenior,
    createCoach: coach.create,
    createCoaches: coach.bulkCreate
});