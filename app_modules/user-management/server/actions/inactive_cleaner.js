/* eslint no-console:off */

import UserInfo from './../../../../collections/UserInfo.js';
import Teams from './../../../../collections/Teams.js';

import { FinanceLogs, MarketActivity, Events } from './../../../../collections/collections.js';

import moment from 'moment';
import removalWarningEmail from './../../../emails/server/js_templates/removal_warning.js';
import userModel from './../models/user-model.js';
import userinfoArchiveModel from './../models/userinfo-archive-model.js';
import { Email } from 'meteor/email';
import { Meteor } from 'meteor/meteor';


function inactiveCleaner() {
    var api = { markForRemoval, remove, inspectRemoval };

    /**
     * First step of the removal process
     * Users (userinfo) that have not logged in in the last 6 weeks are marked for removal
     * @return {[type]} [description]
     */
    function markForRemoval() {
        var dateLimit = moment().subtract(16, 'weeks').toDate();
        var query = { $or: [
            { lastlog: { $lt: dateLimit }},
            { lastlog: { $type: 'string' }},
            { lastlog: { $type: 'number' }}
        ]};

        UserInfo.update(query, {$set: { willRemove: true }}, { multi:true });
        // sendRemovalEmail();
    }

    function sendRemovalEmail() {
        var emails = [];
        var pipe = [
            { $match: { willRemove:true, locked: {$ne: true}}},
            { $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: 'userInfo_id',
                as: 'user'
            }},
            { $unwind: '$user' }
        ];

        var userinfo = UserInfo.aggregate(pipe);

        userinfo.forEach(function (userinfo, i) {
            let email = userModel.getEmail(userinfo.user);
            if (!email) email = userinfo.email;
            if (email) emails.push(email);
            console.log('extract email', i+1);
        });

        emails = emails.reverse();

        var emailsSent = 0;
        var emailsFailed = 0;

        emails.forEach(function (email) {
            try {
                Email.send({
                    to: email,
                    from: 'basketsim@basketsim.com',
                    subject: 'Reactivate your team!',
                    html: removalWarningEmail()
                });
                emailsSent++;
            } catch (e) {
                emailsFailed++;
                console.log('error in sending email', email);
                console.log(e);
            }
        });

        console.log('sendRemovalEmail complete');
        console.log('emails sent', emailsSent);
        console.log('emailsFailed', emailsFailed);

    }

    /** Display lastlog of the teams to be removed */
    function inspectRemoval() {
        var dateLimit = moment().subtract(16, 'weeks').toDate();
        var query = {
            // willRemove: true,
            $or: [
                { lastlog: { $lt: dateLimit }},
                { lastlog: { $type: 'string' }},
                { lastlog: { $type: 'number' }}
            ]
        };
        var userinfo = [];
        var userinfo_lastlog = [];

        userinfo = UserInfo.find(query);
        userinfo_lastlog = userinfo.map(function(ui){ return ui.lastlog; });

        console.log('Users to be removed: ' + userinfo_lastlog.length);
        console.log(userinfo_lastlog.sort());
    }

    /**
     * Second step of the removal process
     * Users (userinfo) that have not logged in in the last 6 weeks and have been marked for removal will be deleted
     * If the user have logged in meanwhile, the removal flag will be removed
     */
    function remove() {
        console.log('User removal started');
        var dateLimit = moment().subtract(16, 'weeks').toDate();
        var query = {
            // willRemove: true,
            $or: [
                { lastlog: { $lt: dateLimit }},
                { lastlog: { $type: 'string' }},
                { lastlog: { $type: 'number' }}
            ]
        };
        var userinfo = [],
            userinfoID = [],
            teamIDs = [];

        userinfo = UserInfo.find(query);
        userinfoID = userinfo.map(function(ui){ return ui._id; });
        teamIDs = userinfo.map(function(ui){ return ui.team_id; });

        /** Add userinfo to archive */
        userinfoArchiveModel.userInfoToArchive(userinfo);
        console.log('   Userinfo added to archive');

        /** Remove users with the userinfo */
        Meteor.users.remove({userInfo_id: { $in: userinfoID }});
        console.log('   Users removed');

        /** Remove the userinfo */
        UserInfo.remove({_id: { $in: userinfoID }});
        console.log('   Userinfo removed');

        /** Remove team events */
        Events.remove({receiver_id: { $in: teamIDs }});
        console.log('   Events removed');

        /** Delete Finance Logs */
        FinanceLogs.remove({team_id: { $in: teamIDs }});
        console.log('   FinanceLogs removed');

        /** Remove market activity of team */
        MarketActivity.remove({team_id: { $in: teamIDs }});
        console.log('   MarketActivity removed');

        /** Add flag on team that it was botified */
        Teams.update({_id: { $in: teamIDs }}, {$set: { shouldReplacePlayers: true }}, { multi: true });
        console.log('   Teams marked for player replacement');

        /** Remove 'willRemove' flag from the surving users */
        UserInfo.update({ willRemove: true }, {$unset: { willRemove:1 }});
        console.log('   UserInfo updated');

        console.log('User Removal Ended');
    }

    return api;
}

export default inactiveCleaner();