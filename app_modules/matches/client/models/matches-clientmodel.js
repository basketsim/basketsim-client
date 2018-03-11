class MatchesClientModel {
    getPlayedMatchesByTeamID(teamID, callback) {
        Meteor.call('matches:getPlayedByTeamID', teamID, function (error, matches) {
            if (error) {
                sAlert.error('There has been an error retrieving the matches. Please refresh and try again');
            } else {
                // Session.set('players', matches);
                callback(_.sortBy(matches, function(match){ return match.dateTime.timestamp}));
            }
        });
    }
    getOwnUnfinished(callback) {
        Meteor.call('matches:getOwnUnfinished', function (error, matches) {
            if (error) {
                sAlert.error('There has been an issue retrieving your matches. Please try again or report it in the bugs forum');
            } else {
                let m = _.sortBy(matches, function(match){ return match.dateTime.timestamp});
                callback(m);
            }
        });
    }
    getOwnFinished(callback) {
        Meteor.call('matches:getOwnFinished', function (error, matches) {
            if (error) {
                sAlert.error('There has been an issue retrieving your matches. Please try again or report it in the bugs forum');
            } else {
                let m = _.sortBy(matches, function(match){ return match.dateTime.timestamp}).reverse();
                callback(m);
            }
        });
    }
    getByID(matchID, callback) {
        Meteor.call('matches:getByID', matchID, function (error, match) {
            if (error) {
                sAlert.error(error.reason);
            } else {
                callback(match);
            }
        });
    }
}

export default new MatchesClientModel();