import { UserInfoArchive } from './../../../../collections/collections.js';
import Teams from './../../../../collections/Teams.js';
import userModel from './user-model.js';

import { Meteor } from 'meteor/meteor';
import _ from 'underscore';

function userinfoArchive() {
    var api = {create, insert, userInfoToArchive};

    function create(userinfo) {
        var archive = {};

        return archive;
    }

    function insert(archive) {
        UserInfoArchive.insert(archive);
    }

    function userInfoToArchive(userinfo) {
        var userinfoID = [];
        var teamIDs = [];
        var teams = [];
        var users = [];
        var userinfoArchives = [];


        userinfoID = userinfo.map(function(ui){ return ui._id; });
        teamIDs = userinfo.map(function(ui){ return ui.team_id; });

        teams = Teams.find({ _id: { $in: teamIDs }}, { fields: { name: 1 }}).fetch();
        users = Meteor.users.find({ userInfo_id: { $in: userinfoID}}).fetch();

        userinfo.forEach(function (userinfo) {
            let team = null,
                user = null,
                email = null;

            if (userinfo.team_id) {
                team = _.find(teams, function(teamObj) { return teamObj._id._str === userinfo.team_id._str; });
            } else {
                team = { name: null };
            }
            user = _.find(users, function(user) { return user.userInfo_id._str === userinfo._id._str; });
            if (user) email = userModel.getEmail(user);
            if (!email) email = userinfo.email;

            let archive = {
                username: userinfo.username,
                email: email,
                teamID: team._id,
                teamName: team.name,
                achievements: userinfo.achievements,
                clubHistory: userinfo.clubHistory,
                createdAt: new Date(),
                canSendEmail: true
            };

            userinfoArchives.push(archive);
        });

        userinfoArchives.forEach(function (arch) {
            api.insert(arch);
        });
    }

    return api;
}

export default userinfoArchive();