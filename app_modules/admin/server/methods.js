import coach from './coach.js';
import training from './../../training/server/api.js';
import financeMigration from './one-time-migration/finance.js';
import markets from './../../markets/server/api.js';
import etcPlayers from './etc/players.js';
import etcTeams from './etc/teams.js';
import updateGameInfo from './game-info/update.js';
import gameText from './game-text/gametext-model.js';
import { Meteor } from 'meteor/meteor';

Meteor.methods({
    'coachAverage': coach.wagePriceAvg,
    'trainSeniorCron': function(){
        if (this.userId !== 'wg2H3Bem7BrERkEsZ') return;
        training.seniorCron.run();
    },
    'rerunTrainSeniorCron': function () {
        if (this.userId !== 'wg2H3Bem7BrERkEsZ') return;
        training.seniorCron.reRun();
    },
    calculateTempMoney: financeMigration.calculateTempMoney,
    runEndTransfers: markets.transfer.finish,
    checkNan: etcPlayers.checkNan,
    activeTeamsPerCountry: etcTeams.activeTeamsPerCountry,
    'admin:game-info:addGameInfo': function() {
        if (this.userId !== 'wg2H3Bem7BrERkEsZ') return;
        updateGameInfo.addCollection();
    },
    'admin:game-info:weekProgress': function() {
        if (this.userId !== 'wg2H3Bem7BrERkEsZ') return;
        updateGameInfo.weekProgress();
    },
    'admin:game-info:advanceCalendarWeek': function() {
        if (this.userId !== 'wg2H3Bem7BrERkEsZ') return;
        updateGameInfo.weekProgress();
    },
    'admin:insert-game-text': insertGameText
});

function insertGameText() {
    if (this.userId !== 'wg2H3Bem7BrERkEsZ') return;
    gameText.insert();
}