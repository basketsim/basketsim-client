import teamDataModel from './../../../teams/server/models/team-datamodel.js';
class PlayersDataModel {
    getOwn(reqID) {
        var userinfoID = sbutils.general.userinfoID(reqID);
        var teamID = UserInfo.findOne({_id: userinfoID}, {fields: {team_id: 1}}).team_id;
        var fields = fieldRights(true);
        var players = Players.find({team_id:teamID}, {fields: fields}).fetch();
        return players;
    }
    getByID(playerID, reqID) {
        var canSeeDets = this.canSee(playerID, reqID);
        var fields = fieldRights(canSeeDets);

        var player = Players.findOne({_id: playerID}, {fields: fields});
        return player;
    }
    getByTeamID(teamID, reqID) {
        if (!teamID) return [];
        var isOwn = teamDataModel.isOwn(teamID, reqID);
        var fields = fieldRights(isOwn);
        return Players.find({team_id:teamID}, {fields: fields}).fetch();
    }
    getNamesByIDList(playerIDs) {
        return Players.find({_id: {$in: playerIDs}}, {fields: {name:1, surname:1}}).fetch();
    }
    canSee(playerID, reqID) {
        var userinfoID = sbutils.general.userinfoID(reqID);
        var teamID = UserInfo.findOne({_id: userinfoID}, {fields: {team_id: 1}}).team_id;
        var player = Players.findOne({_id: playerID}, {fields:{team_id: 1, transfer_id:1}});

        if (player.team_id && (teamID._str === player.team_id._str || player.transfer_id)) {
            return true;
        } else {
            return false;
        }
    }
}

function fieldRights(canSee) {
    var fields = {};

    if (canSee) {
        fields = {

        }
    } else {
        fields = {
            age: 1,
            character: 1,
            coach: 1,
            country: 1,
            fatigue: 1,
            height: 1,
            ntplayer: 1,
            price: 1,
            shirt: 1,
            statement: 1,
            surname: 1,
            team_id: 1,
            wage: 1,
            weight: 1,
            name: 1,
            transfer_id: 1,
            ev: 1,
            stats:1,
            //coach fields
            seniorAbility: 1,
            youthAbility: 1,
            experience: 1, //this is exposing experience, is it okay?
            motiv: 1,
            transfers:1
        }
    }

    return fields;
}

export default new PlayersDataModel();