import financeModel from './../models/finance-model.js';
import { FinanceLogs, GameText } from './../../../../collections/collections.js';
// import moment from 'moment';
import mongojs from 'mongojs';

function financeReport(teamID) {
    var lastWeeklyLogs = FinanceLogs.findOne({team_id: teamID, type: 'weekly_update'}, {sort: {createdAt:-1}});
    if (!lastWeeklyLogs) return emptyReport();
    var lastLogs = getLastLogs(lastWeeklyLogs);
    var lastWeekLogs = getLastWeekLogs(lastWeeklyLogs);
    var report = {
        sponsors: { value: lastLogs.sponsors, info: lastLogs.info_sponsors },
        advertising: { value: lastLogs.advertising, info: lastLogs.info_advertising },
        tickets: lastWeekLogs.tickets,
        paidSalaries: lastLogs.salaries,
        currSalaries: financeModel.getSalaries(teamID),
        cheerleaders: lastLogs.cheerleaders,
        youth: lastWeekLogs.youth
    };

    return report;
}

function emptyReport() {
    return {
        sponsors: { value: 0, info: "Your accountant is gathering the financial data of the club" },
        advertising: { value: 0, info: "Your accountant is gathering the financial data of the club" },
        tickets: 0,
        paidSalaries: 0,
        currSalaries: 0,
        cheerleaders: 0,
        youth: 0
    };
}

function getLastLogs(wl) {
    wl.info_sponsors = GameText.findOne({tt: wl.info_sponsors.tt, o: wl.info_sponsors.o, v: wl.info_sponsors.v}).text;
    wl.info_advertising = GameText.findOne({tt: wl.info_advertising.tt, o: wl.info_advertising.o, v: wl.info_advertising.v}).text;

    return wl;
}

function getLastWeekLogs(wl) {
    var date = wl.createdAt;
    var teamID = mongojs.ObjectId(wl.team_id._str);

    var pipe = [
        { $match: { team_id: teamID, createdAt: { $gt: new Date(date) }}},
        { $group: { _id: null, tickets: { $sum: '$tickets' }, youth: { $sum: '$youth' }}}
    ];

    var logs = FinanceLogs.aggregate(pipe)[0];

    if (!logs) logs = {
        tickets: 0,
        youth: 0
    };


    return logs;
}

export default financeReport;