class TeamClientModel {
    getOwn(callback) {
        var team = Session.get('team');
        if (!team) {
            getOwnTeam(callback);
        } else {
            callback(team);
        }
    }
    refreshOwn(callback) {
        getOwnTeam(callback);
    }

    getByID(teamID, callback) {
        var ownTeam = Session.get('team');

        if (ownTeam) {
            getTeam(ownTeam, teamID, callback);
        } else {
            this.getOwn(function(result){
                getTeam(result, teamID, callback);
            });
        }

        /** Get team based on own team and desired team */
        function getTeam(ownTeam, teamID, callback) {
            if (teamID._str === ownTeam._id._str) {
                callback(ownTeam);
            } else {
                Meteor.call('teams:getByID', teamID, function (error, result) {
                    if (error) {
                        if (location.pathname !== '/create-club') sAlert.error('There has been an error retrieving the team. Please refresh and try again');
                    } else {
                        callback(result);
                    }
                });
            }
        }
    }

    getFinanceData(teamID, callback) {
        Meteor.call('finances:financeReport', teamID, function (error, result) {
            if (error) {
                sAlert.error('There was an issue retrieving the financial info');
                console.log('finance data error', error);
            } else {
                callback(result);
            }
        });
    }
}

function getOwnTeam(callback) {
    Meteor.call('teams:getOwn', function (error, result) {
        if (error) {
            if (location.pathname !== '/create-club') sAlert.error('There has been an error retrieving your team. Please refresh and try again');
        } else {
            Session.set('team', result);
            callback(result);
        }
    });
}

export default new TeamClientModel();