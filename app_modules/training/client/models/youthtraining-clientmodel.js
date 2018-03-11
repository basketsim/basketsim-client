class YouthTrainingModel {
    getByPlayerIDList(playerIDs, callback) {
        if (Session.get('youthTrainings') && Session.get('youthTrainings').length === playerIDs.length) {
            callback(Session.get('youthTrainings'));
        } else {
            getYTByPlayerIDList(playerIDs, callback);
        }
    }

    getByPlayerID(playerID, callback) {
        var trainings = Session.get('youthTrainings');
        if (trainings && trainings[0]) {
            let training = _.find(trainings, function(tr){
                return playerID._str === tr.player_id._str;
            });

            callback(training);
        } else {
            getYTByPlayerID(playerID, callback);
        }
    }

    refreshByPlayerIDList(playerIDs, callback) {
        getYTByPlayerIDList(playerIDs, callback);
    }

    refreshByPlayerID(playerID, callback) {
        getYTByPlayerID(playerID, callback);
    }
}

function getYTByPlayerIDList(playerIDs, callback) {
    if (!playerIDs) return;
    Meteor.call('training:youth:getByPlayerIDList', playerIDs, function (error, youthTrainings) {
        if (error) {
            sAlert.error('There has been an issue with retrieving the youth training. Please try again or report the issue');
        } else {
            callback(youthTrainings);
            Session.set('youthTrainings', youthTrainings);
        }
    });
}

function getYTByPlayerID(playerID, callback) {
    if (!playerID) return;
    Meteor.call('training:youth:getByPlayerID', playerID, function (error, youthTrainings) {
        if (error) {
            sAlert.error('There has been an issue with retrieving the youth training. Please try again or report the issue');
        } else {
            callback(youthTrainings);
        }
    });
}

export default new YouthTrainingModel();