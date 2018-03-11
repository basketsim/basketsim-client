import {assert} from 'chai';
import arenaModel from './../models/arena-datamodel';
import arenaHelpers from './../../common/helpers/arena-updates-helpers';
import arenaUpdatesModel from './../models/arena-updates-model';
import financeModel from './../../../finances/server/models/finance-model';
import news from './../../../news/server/api';
import {ArenaUpdates, Arenas} from './../../../../collections/collections';
import commonUtils from './../../../utils/common/common-utils';
import arenaUpdateModelHelper from './../helpers/arena-updates-helpers';
import moment from 'moment';
import {Meteor} from 'meteor/meteor';

const arenaActions = {
    upgrade, cancelUpgrade, finishConstruction
};

function upgrade(newSeats, buildOption, userID) {
    const arena = arenaModel.getOwn(userID);
    const existingUpgrade = ArenaUpdates.findOne({arena_id: arena._id, complete: false});
    validateUpgrade(arena, newSeats, buildOption, existingUpgrade);

    const futureTotal = arenaHelpers.totalSeats(arena) + newSeats.total;
    const costType = buildOption === 'fast-build' ? 'total_fast' : 'total';
    const cost = arenaHelpers.cost(costType,newSeats,arena);
    const duration =  buildOption === 'fast-build' ? Math.round(arenaHelpers.duration(newSeats.total)/2) : arenaHelpers.duration(newSeats.total);
    const completionDate = moment().add(duration, 'days').toDate();

    const upgrade = arenaUpdateModelHelper.create(arena._id, completionDate, cost, newSeats.court_side, newSeats.court_end, newSeats.upper_level, newSeats.vip);

    ArenaUpdates.insert(upgrade, function (err) {
        if (!err) {
            financeModel.logArenaUpgrade(arena.team_id, cost);
            news.game.arenaUpgrade(arena.team_id, cost, completionDate, futureTotal);
        } else {
            throw err;
        }
    });

    return upgrade;
}

function cancelUpgrade(userID) {
    const arena = arenaModel.getOwn(userID);
    const arenaUpdate = ArenaUpdates.findOne({arena_id: arena._id, complete:false}, {fields: {price:1}});
    if (!arenaUpdate) throw new Meteor.error('arena-cancellation', 'Your arena is not beeing upgraded right now');

    ArenaUpdates.update({_id: arenaUpdate._id}, {$set: {
        cancelled: true,
        complete: true,
        cancelation_date: new Date()
    }}, function (err) {
        if (!err) {
            financeModel.arenaUpgradeCancellation(arena.team_id, arenaUpdate.price);
            news.game.arenaUpgradeCancellation(arena.team_id, arenaUpdate.price);
        } else {
            throw err;
        }
    });
}
/**
 * Finish Construction for all arena updates that should be done
 * Increases Arena capacity
 * Marks Arena Update as complete
 * Sends news
 * */
function finishConstruction() {
    console.log('START: Finish Arena Construction');
    const upgrades = ArenaUpdates.find({complete: false, completion_date: {$lte: new Date()}});
    upgrades.forEach((upgrade) => {
        //increase arena size
        Arenas.update({_id: upgrade.arena_id}, {$inc: {
            court_side: upgrade.court_side,
            court_end: upgrade.court_end,
            upper_level: upgrade.upper_level,
            vip: upgrade.vip
        }}, function (err) {
            if (err) throw new Meteor.Error('error', 'Arena update failed');

            //mark arena update object as complete
            ArenaUpdates.update({_id: upgrade._id}, {$set: {
                complete: true
            }});

            //send news that arena has finished
            const arena = Arenas.findOne({_id: upgrade.arena_id}, {fields: {team_id:1}});
            news.game.arenaUpgradeFinished(arena.team_id);
        });
    });

    console.log('END: Finish Arena Construction');
}

/**
 * Rules:
 * User must have an arena
 * Arena cannot be building
 * Arena cannot be updated to more than 80000 seats
 * Update must be of at least 100 seats
 * All seat_types must be at least 0
 * @param arena
 * @param newSeats
 * @param buildOption
 */
function validateUpgrade(arena, newSeats, buildOption, existingUpgrade) {
    const futureTotal = arenaHelpers.totalSeats(arena) + newSeats.total;
    try {
        assert.isOk(arena, 'Your arena cannot be retrieved');
        assert.isNotOk(existingUpgrade, 'You cannot order a new upgrade while arena is under construction');
        assert.isAtLeast(newSeats.total, 100, 'You must build at least 100 seats');
        assert.isAtLeast(newSeats.court_side, 0, 'Court Side Seats cannot be lower than 0');
        assert.isAtLeast(newSeats.court_end, 0, 'Court End Seats cannot be lower than 0');
        assert.isAtLeast(newSeats.upper_level, 0, 'Upper Level Seats cannot be lower than 0');
        assert.isAtLeast(newSeats.vip, 0, 'VIP Seats cannot be lower than 0');
        assert.include(['normal-build', 'fast-build'], buildOption, 'Unrecognised build option');
        assert.isAtMost(futureTotal, 80000, 'Your arena cannot have more than 80.000 seats');
    } catch (err) {
        commonUtils.error('arena-upgrade', err);
    }

}

export default arenaActions;