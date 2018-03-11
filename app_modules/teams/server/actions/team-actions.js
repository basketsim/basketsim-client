import Teams from './../../../../collections/Teams.js';
import moment from 'moment';

const teamActions = { updateAllTransferBans };

//remaining = length - (currdate - startDate)
function updateAllTransferBans() {
    Teams.find({'transfer_banned.remaining': {$gt: 0}}, {fields: {transfer_banned:1}}).forEach((team) => {
        const length = team.transfer_banned.length;
        let difference = moment().valueOf() - team.transfer_banned.date.valueOf();
        let remaining = length - parseInt(moment.duration(difference).asDays());

        if (remaining <= 0) remaining = 0;

        Teams.update({_id: team._id}, {$set: {
            'transfer_banned.remaining': remaining
        }}, function () {});
    });
}

export default teamActions;