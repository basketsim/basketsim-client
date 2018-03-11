import ceq from 'ceq';
import {assert} from 'chai';

const arenaUpdatesHelpers = {
    create
};

function create(arenaID, completionDate, price, courtSide, courtEnd, balcony, vip) {
    ceq([[assert.isAtLeast, price, 0], [assert.isAtLeast, courtSide, 0], [assert.isAtLeast, courtEnd, 0],
        [assert.isAtLeast, balcony, 0], [assert.isAtLeast, vip, 0]]);

    const arenaUpdate = {
        arena_id: arenaID,
        createdAt: new Date(),
        completion_date: completionDate,
        court_side: courtSide,
        court_end: courtEnd,
        upper_level: balcony,
        vip: vip,
        price: price,
        complete: false,
        cancelled: false
    };

    return arenaUpdate;
}

export default arenaUpdatesHelpers;

