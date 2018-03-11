import teamModel from './../../../teams/client/models/team-clientmodel.js';

class PlayersClientModel {
    /** assume the team always has all the players
        update the players when the team sells, fires or promotes
     */
    getOwn(callback) {
        var players = Session.get('players');
        if (!players || !players[0]) {
            getOwnPlayers(callback);
        } else {
            callback(players);
        }
    }

    refreshOwn(callback) {
        getOwnPlayers(callback);
    }

    getByTeamID(teamID, callback) {
        var ownTeam = Session.get('team');
        var ownPlayers = Session.get('players');
        var self = this;
        if (!teamID) {
            callback([]);
            return;
        }
        if (!ownTeam) {
            teamModel.getOwn(function(result){
                ownTeam = result;
                if (ownTeam._id._str === teamID._str) {
                    if (!ownPlayers || !ownPlayers[0]) {
                        self.getOwn(callback);
                    } else {
                        callback(ownPlayers);
                    }
                } else {
                    getPlayersByTeamID(teamID, callback)
                }
            });
        } else {
            if (ownTeam._id._str === teamID._str) {
                if (!ownPlayers || !ownPlayers[0]) {
                    self.getOwn(callback);
                } else {
                    callback(ownPlayers);
                }
            } else {
                getPlayersByTeamID(teamID, callback)
            }
        }
    }

    refreshByTeamID(teamID, callback) {
        getPlayersByTeamID(teamID, callback);
    }

    getByID(playerID, callback) {
        var ownPlayers = Session.get('players');
        var player = null;
        if (ownPlayers && ownPlayers[0]) {
            player = _.find(ownPlayers, function(oplayer){
                return playerID === oplayer._id._str;
            });
        }

        if (player) {
            callback(player);
        } else {
            getPlayerByID(playerID, callback);
        }
    }

    getNamesByIDList(playerIDs, callback) {
        Meteor.call('players:getNamesByIDList', playerIDs, function (error, players) {
            if (error) {
                sAlert.error("There has been an error retrieving the players. Please refresh and try again or file a bug report");
            } else {
                callback(players);
            }
        });
    }

    refreshByID(playerID, callback) {
        getPlayerByID(playerID, callback);
    }
}

function getOwnPlayers(callback) {
    Meteor.call('players:getOwn', function (error, result) {
        if (error) {
            sAlert.error('There has been an error retrieving the players. Please refresh and try again');
        } else {
            Session.set('players', result);
            callback(result);
        }
    });
}

function getPlayersByTeamID(teamID, callback) {
    Meteor.call('players:getByTeamID', teamID, function (error, result) {
        if (error) {
            sAlert.error('There has been an error retrieving the player. Please refresh and try again');
        } else {
            callback(result);
        }
    });
}


function getPlayerByID(playerID, callback) {
    //check on the server if the player is own
    Meteor.call('players:getByID', playerID, function (error, result) {
        if (error) {
            sAlert.error('There has been an error retrieving the player. Please refresh and try again')
        } else {
            callback(result);
        }
    });
}

export default new PlayersClientModel();