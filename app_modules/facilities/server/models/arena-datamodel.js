import teamDataModel from './../../../teams/server/models/team-datamodel.js';

class ArenaDataModel {
    getByID() {

    }
    getByTeamID(teamID, reqID) {
        var isOwn = teamDataModel.isOwn(teamID, reqID);
        var fields = fieldRights(isOwn);
        return Arenas.findOne({team_id: teamID}, {fields: fields});
    }
    getOwn(reqID) {
        var userinfoID = sbutils.general.userinfoID(reqID);
        var teamID = UserInfo.findOne({_id: userinfoID}, {fields: {team_id: 1}}).team_id;
        return Arenas.findOne({team_id: teamID}, {fields: fieldRights(true)});
    }
    isOwn(arenaID, reqID) {

    }
}

function fieldRights(isOwn) {
    var fields = {};

    if (!isOwn) {
        fields = {
            arenaname: 1,
            team_id: 1,
            court_side: 1,
            court_end: 1,
            upper_level: 1,
            vip: 1,
            in_use: 1,
            fans: 1,
            cheer_name: 1,
            cheer_logo: 1
        };
    } else {
        fields = {
            week_ideal: 0,
            season_ideal: 0,
            history: 0,
            upgrade_date: 0
        };
    }

    return fields;
}

export default new ArenaDataModel();
