import {ArenaUpdates} from './../../../../collections/collections';
import arenaModelHelper from './../helpers/arena-updates-helpers';


const arenaUpdatesModel = {
    insert
}

function insert(arenaID, completionDate, price, courtSide, courtEnd, balcony, vip, callback) {
    const arenaUpgrade = arenaModelHelper.create(arenaID, completionDate, price, courtSide, courtEnd, balcony, vip);
    ArenaUpdates.insert(arenaUpgrade, callback);
}

export default arenaUpdatesModel;