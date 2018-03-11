import {Meteor} from 'meteor/meteor';
const arenaUpdatesModel = {
    getByArenaID
};

function getByArenaID(arenaID, callback) {
    Meteor.call('facilities:arena-updates:getByArenaID', arenaID, function (err, arenaUpdate) {
        if (err) {
            sAlert.error(err.reason);
        } else {
            callback(arenaUpdate);
        }
    });
}

export default arenaUpdatesModel;