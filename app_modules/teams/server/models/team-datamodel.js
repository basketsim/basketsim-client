import Teams from './../../../../collections/Teams.js';
import UserInfo from './../../../../collections/UserInfo.js';
import {Meteor} from 'meteor/meteor';
import _ from 'underscore';
import sbutils from './../../../utils/server/api.js';

class TeamDataModel {
    getByID(teamID, reqID) {
        var isOwn = this.isOwn(teamID, reqID);
        var fields = fieldRights(isOwn);
        return Teams.findOne({_id: teamID}, {fields:fields});
    }
    getOwn(reqID, fields) {
        var userinfoID = sbutils.general.userinfoID(reqID);
        var teamID = UserInfo.findOne({_id: userinfoID}, {fields: {team_id: 1}}).team_id;
        return Teams.findOne({_id: teamID}, {fields:fields});
    }
    // getByUserID(userID, reqID) {
    //
    // }
    // getByUserInfoID(userinfoID, reqID) {
    //
    // }
    isOwn(teamID, reqID) {
        var ownUserInfoID = {},
            ownTeamID = {};

        ownUserInfoID = Meteor.users.findOne({_id: reqID}, {fields:{userInfo_id:1}}).userInfo_id;
        ownTeamID = UserInfo.findOne({_id: ownUserInfoID}, {fields:{team_id:1}});

        if (teamID._str === ownTeamID._str) {
            return true;
        } else {
            return false;
        }
    }
    getActive(fields) {
        var activeTeams = activeTeamsIDs();
        if (!fields) fields = {};
        return Teams.find({_id: {$in: activeTeams}}, {fields:fields}).fetch();
    }
    getActiveBy(queryObj, fields) {
        var activeTeams = activeTeamsIDs();
        if (!fields) fields = {};
        queryObj._id = {
            $in: activeTeams
        };
        return Teams.find(queryObj, {fields:fields}).fetch();
    }
}

function activeTeamsIDs() {
    var userInfo = UserInfo.find({}, {fields:{team_id:1}}).fetch();
    var activeTeams = [];
    _.each(userInfo, function(user){
        activeTeams.push(user.team_id);
    });

    return activeTeams;
}
/**
 * Returns fields the user is allowed to see
 * @param  {[type]} isOwn [description]
 * @return {[type]}         [description]
 */
function fieldRights(isOwn) {
    var fields = {};
    if (isOwn) {
        fields = {
        };
    } else {
        fields = {
            name: 1,
            country: 1,
            shirt: 1,
            logo: 1,
            conwins: 1,
            competitions: 1,
            stats: 1
        };
    }

    return fields;
}

export default new TeamDataModel();