import coach from './../coach.js';
import youthTrainingModel from './../models/youthtraining-datamodel.js';
import seniorCron from './../senior-cron.js';

Meteor.methods({
    renewCoachContract: renewCoachContract,
    'training:youth:getByPlayerIDList': getByPlayerIDList,
    'training:youth:getByPlayerID': getByPlayerID,
    'training:senior:clean': cleanSeniorTraining,
    'training:senior:run': runSeniorTraining
});

function renewCoachContract(coach_id) {
    coach.renewCoachContract(this.userId, coach_id);
}

function getByPlayerIDList(playerIDs) {
    return youthTrainingModel.getByPlayerIDList(playerIDs);
}

function getByPlayerID(playerID) {
    return youthTrainingModel.getByPlayerID(playerID);
}

function runSeniorTraining() {
    if (!sbutils.validations.isAdmin(this.userId)) return;
    seniorCron.run();
}

function cleanSeniorTraining() {
    if (!sbutils.validations.isAdmin(this.userId)) return;
    seniorCron.clean();
}