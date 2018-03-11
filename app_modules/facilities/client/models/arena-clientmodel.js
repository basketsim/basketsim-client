class ArenaClientModel {
    getByTeamID(teamID, callback) {
        var ownArena = Session.get('arena');

        if (ownArena) {
            getArena(ownArena, teamID, callback);
        } else {
            this.getOwn(function(result){
                getArena(result, teamID, callback);
            });
        }

        /** Get arena based on own team and desired team */
        function getArena(ownArena, teamID, callback) {
            if (teamID._str === ownArena.team_id._str) {
                callback(ownArena);
            } else {
                Meteor.call('facilities:arena:getByTeamID', teamID, function (error, result) {
                    if (error) {
                        if (location.pathname !== '/create-club') sAlert.error('There has been an error retrieving your arena. Please refresh and try again');
                    } else {
                        callback(result);
                    }
                });
            }
        }
    }
    getOwn(callback) {
        var arena = Session.get('arena');
        if (!arena) {
            Meteor.call('facilities:arena:getOwn', function (error, result) {
                if (error) {
                    if (location.pathname !== '/create-club') sAlert.error('There has been an error retrieving your arena. Please refresh and try again');
                } else {
                    callback(result);
                    Session.set('arena', result);
                }
            });
        } else {
            callback(arena);
        }

    }
}

export default new ArenaClientModel();