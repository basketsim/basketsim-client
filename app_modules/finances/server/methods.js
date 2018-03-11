import weeklyUpdate from './actions/weekly_update.js';
import getFinanceReport from './actions/get_finance_report.js';
import { Meteor } from 'meteor/meteor';

Meteor.methods({
    'finances:actions:weeklyUpdate': weeklyUpdate.run,
    'finances:financeReport': financeReport
});

function financeReport(teamID) {
    console.log('get finances data', teamID);
    var financeReport = getFinanceReport(teamID);

    return financeReport;
}