import { Meteor } from 'meteor/meteor';
import teamsModel from './../../../teams/server/models/team-datamodel.js';
import GameInfo from './../../../../collections/GameInfo.js';
import Players from './../../../../collections/Players.js';
import Matches from './../../../../collections/Matches.js';
import Teams from './../../../../collections/Teams.js';

import mongojs from 'mongojs';


Meteor.methods({
    'stats:financial:teams-average-salaries': teamsAverageSalaries
});

/**
 * Save these and other in the db
 * Add arena capacity per level
 * Add attendance per level
 */
function teamsAverageSalaries() {
    var cs = GameInfo.findOne().season;
    var teams = teamsModel.getActive({_id:1});
    var teamIDs = teams.map(function(team){return mongojs.ObjectId(team._id._str);});

    var salariesPerLevel = getSalariesPerLevel(teamIDs, cs);
    var attendanceIncomePerLevel = getAttendanceIncomePerLevel(teamIDs, cs);
    var wealthPerLevel = getWealthPerLevel(teamIDs, cs);
    var totalWealth = getTotalWealth(teamIDs);

    console.log(salariesPerLevel, attendanceIncomePerLevel, wealthPerLevel);
    console.log('totalWealth', totalWealth);
}

function getSalariesPerLevel(teamIDs, cs) {
    var levelField = 'competitions.natLeague.seasons.' + cs + '.level';
    var pipe = [
        { $match: { _id: {$in: teamIDs} }},
        { $lookup: {
            from: 'players',
            localField: '_id',
            foreignField: 'team_id',
            as: 'players'
        }},
        { $group: { _id: '$'+levelField, avgWage: {$avg: {$sum: '$players.wage' }}}},
        { $sort: { _id: 1 }}
    ];

    return Teams.aggregate(pipe);
}

function getAttendanceIncomePerLevel(teamIDs, cs) {
    var attPerLevel = getAttendancePerLevel(teamIDs, cs);
    var income = {};

    attPerLevel.forEach(function (att) {
        if (att._id) {
            income[att._id] = {
                courtSide: Math.round(att.avg_att_courtSide * 15),
                courtEnd: Math.round(att.avg_att_courtEnd * 20),
                upperLevel: Math.round(att.avg_att_upperLevel * 20),
                vip: Math.round(att.avg_att_vip * 100)
            };
            income[att._id].total = income[att._id].courtSide + income[att._id].courtEnd + income[att._id].upperLevel + income[att._id].vip;
        }
    });

    return income;
}

function getWealthPerLevel(teamIDs, cs) {
    console.log('start getWealthPerLevel');
    var time = new Date().valueOf();
    var wealthPerLevel = null;
    var levelField = 'competitions.natLeague.seasons.' + cs + '.level';

    var pipe = [
        { $match: {_id: { $in: teamIDs }}},
        { $group: { _id: '$'+levelField, avgWealth: {$avg: {$sum: '$curmoney' }}}},
        { $sort: { _id: 1 }}
    ];

    wealthPerLevel = Teams.aggregate(pipe);
    var delta = (new Date().valueOf() - time)/1000;
    console.log('getWealthPerLevel done in', delta, 'seconds');
    return wealthPerLevel;
}

function getTotalWealth(teamIDs) {
    console.log('start getTotalWealth');
    var time = new Date().valueOf();
    var wealthPerLevel = null;

    var pipe = [
        { $match: {_id: { $in: teamIDs }}},
        { $group: { _id: null, totalWealth: {$sum: '$curmoney' }}}
    ];

    wealthPerLevel = Teams.aggregate(pipe);
    var delta = (new Date().valueOf() - time)/1000;
    console.log('getTotalWealth done in', delta, 'seconds');
    return wealthPerLevel[0];
}

function getAttendancePerLevel(teamIDs, cs) {
    var attPerLevel = null;
    var levelField = 'team_info.competitions.natLeague.seasons.' + cs + '.level';
    var pipe = [
        { $match: { 'competition.season': cs, 'state.finished':true, 'competition.collection':'Leagues', 'homeTeam.id': { $in: teamIDs }}},
        { $group: { _id: '$homeTeam.id',
                    avg_att_courtSide: {$avg: {$sum: '$attendance.courtSide' }},
                    avg_att_courtEnd: {$avg: {$sum: '$attendance.courtEnd' }},
                    avg_att_upperLevel: {$avg: {$sum: '$attendance.upperLevel' }},
                    avg_att_vip: {$avg: {$sum: '$attendance.vip' }}
        }},
        { $lookup: {
            from: 'teams',
            localField: '_id',
            foreignField: '_id',
            as: 'team_info'
        }},
        { $unwind: '$team_info' },
        { $group: { _id: '$' + levelField,
                    avg_att_courtSide: {$avg: {$sum: '$avg_att_courtSide' }},
                    avg_att_courtEnd: {$avg: {$sum: '$avg_att_courtEnd' }},
                    avg_att_upperLevel: {$avg: {$sum: '$avg_att_upperLevel' }},
                    avg_att_vip: {$avg: {$sum: '$avg_att_vip' }}
        }},
        { $sort: { _id: 1 }}
    ];

    attPerLevel = Matches.aggregate(pipe);
    return attPerLevel;
}

function getAttendancePerTeam(teamIDs, cs) {
    var attPerTeam = null;
    var pipe = [
        { $match: { 'competition.season': cs, 'state.finished':true, 'competition.collection':'Leagues', 'homeTeam.id': { $in:teamIDs }}},
        { $group: { _id: '$homeTeam.id',
                    avg_att_courtSide: {$avg: {$sum: '$attendance.courtSide' }},
                    avg_att_courtEnd: {$avg: {$sum: '$attendance.courtEnd' }},
                    avg_att_upperLevel: {$avg: {$sum: '$attendance.upperLevel' }},
                    avg_att_vip: {$avg: {$sum: '$attendance.vip' }}
        }}
    ];

    attPerTeam = Matches.aggregate(pipe);
    return attPerTeam;
}
