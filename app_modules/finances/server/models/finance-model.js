import { FinanceLogs } from './../../../../collections/collections.js';
import Players from './../../../../collections/Players.js';
import spending from './../spending.js';
import mongo from 'mongojs';
import teamEvents from './../../../news/server/api.js';

function financeModel() {
    var api = { updateWeekly, getSalaries, logAddYouth, logAttendanceIncome, adjustTransfer, cancelTransfer, logArenaUpgrade, arenaUpgradeCancellation };

    function updateWeekly(team, advertising, sponsors, salaries, cheerleaders) {
        var balance = advertising.value + sponsors.value - salaries - cheerleaders;
        var budget = team.curmoney + balance;
        FinanceLogs.insert({
            createdAt: new Date(),
            team_id: team._id,
            type: 'weekly_update',
            sponsors: sponsors.value,
            advertising: advertising.value,
            salaries: salaries,
            cheerleaders: cheerleaders,
            info_sponsors: sponsors.text,
            info_advertising: advertising.text,
            balance: balance,
            budget: budget,
            display: true
        }, function(){
            spending.addMoney(team._id, balance);
            teamEvents.game.financeUpdate(team._id, advertising.value, sponsors.value, salaries, cheerleaders, balance);
        });
    }

    function adjustTransfer(teamID, transferID, deductSum) {
        FinanceLogs.insert({
            createdAt: new Date(),
            team_id: teamID,
            transferID: transferID,
            type: 'adjusted_transfer',
            adjustment: deductSum
        }, function () {
            spending.addMoney(teamID, -deductSum);
            teamEvents.game.adjustedTransfer(teamID, transferID, deductSum);
        });
    }

    function cancelTransfer(teamID, transferID, cancelledPrice, playerID) {
        FinanceLogs.insert({
            createdAt: new Date(),
            team_id: teamID,
            transferID: transferID,
            type: 'cancelled_transfer',
            adjustment: cancelledPrice
        }, function () {
            spending.addMoney(teamID, -cancelledPrice);
            teamEvents.game.cancelledTransfer(teamID, transferID, playerID);
        });
    }

    function logAddYouth(teamID, expense) {
        FinanceLogs.insert({
            createdAt: new Date(),
            team_id: teamID,
            type: 'add_youth',
            youth: expense
        });
    }

    function logAttendanceIncome(teamID, income) {
        FinanceLogs.insert({
            createdAt: new Date(),
            team_id: teamID,
            type: 'attendance',
            tickets: income
        });
    }

    function logArenaUpgrade(teamID, price) {
        FinanceLogs.insert({
            createdAt: new Date(),
            team_id: teamID,
            type: 'arena-upgrade',
            price: price
        }, function(){
            spending.addMoney(teamID, -price);
        });
    }

    function arenaUpgradeCancellation(teamID, price) {
        FinanceLogs.insert({
            createdAt: new Date(),
            team_id: teamID,
            type: 'arena-upgrade-cancellation',
            price: price
        }, function(){
            spending.addMoney(teamID, price);
        });
    }

    function getSalaries(teamID) {
        teamID = mongo.ObjectId(teamID._str);
        var salaries = 0;

        var pipe = [
            { $match: { team_id: teamID }},
            { $group: { _id: null, salaries: { $sum: '$wage' }}}
        ];

        var agg = Players.aggregate(pipe)[0];
        if (agg && agg.salaries) {
            salaries = agg.salaries;
        } else {
            console.log('there are no salaries for ', teamID);
        }

        return salaries;
    }

    return api;
}

export default financeModel();