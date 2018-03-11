import {Template} from 'meteor/templating';
import {ReactiveVar} from 'meteor/reactive-var';
import {Meteor} from 'meteor/meteor';

import arenaIdealDistribution from './../helpers/arena-ideal-distribution';
import cutils from './../../../utils/client/api';
import updateHelpers from './../../common/helpers/arena-updates-helpers';

Template.ArenaUpgrade.onCreated(function () {
    this.cdata = {
        new_court_side: new ReactiveVar(0),
        new_court_end: new ReactiveVar(0),
        new_upper_level: new ReactiveVar(0),
        new_vip: new ReactiveVar(0),
        new_total: new ReactiveVar(0)
    };

    console.log('Arena Upgrade', this);
});

Template.ArenaUpgrade.events({
    'keyup #arena-total, paste #arena-total': distributeSeats,
    'keyup .arena-section, paste .arena-section': increaseTotalSeats,
    'click .arena-build-btn': build
});

Template.ArenaUpgrade.helpers({
    dotify: cutils.general.dotify,
    getNewSeats: getNewSeats,
    cost: cost,
    duration: duration,
    halfDuration: halfDuration
});

function build(e, tpl) {
    const id = tpl.$(e.currentTarget)[0].id;
    const arena = tpl.data.arena;
    const newSeats = allNewSeats();

    if (arena.total + newSeats.total > 80000) {
        sAlert.error('Arena cannot be bigger than 80.000 seats');
        return;
    }
    if (newSeats.total < 100) {
        sAlert.error('You cannot order less than 100 seats');
        return;
    }

    Meteor.call('facilities:arena:upgrade', newSeats, id, function (err, upgrade) {
        if (err) {
            sAlert.error(err.reason);
        } else {
            sAlert.success('Your have submitted the build order. The building company will start the work soon');
            console.log('SUCCESS - arena upgrade', upgrade);
            tpl.data.reactiveArenaUpdate.set(upgrade);
        }
    });

}

function allNewSeats() {
    const cdata = Template.instance().cdata;
    const newSeats = {
        court_side: cdata.new_court_side.get() || 0,
        court_end: cdata.new_court_end.get() || 0,
        upper_level: cdata.new_upper_level.get() || 0,
        vip: cdata.new_vip.get() || 0,
        total: cdata.new_total.get() || 0
    };

    return newSeats;
}

function cost(seatType) {
    const tpl = Template.instance();
    const arena = tpl.data.arena;
    if (!arena) return;
    const newSeats = allNewSeats();
    return updateHelpers.cost(seatType, newSeats, arena);
}

function duration() {
    const cdata = Template.instance().cdata;
    const total = cdata.new_total.get();

    return updateHelpers.duration(total);
}

function halfDuration(totalSeats) {
    return Math.round(duration(totalSeats)/2);
}

function increaseTotalSeats(e, tpl) {
    const id = tpl.$(e.target)[0].id;
    const value = cutils.general.formatNumberInput(tpl.$(tpl.$(e.target)[0]), 0, 80000);
    const side = id.replace('arena-', '');

    setNewSeats(side, value);
    setNewSeats('total', computeTotal(tpl.cdata));

    showSummary(tpl);
}

function computeTotal(cdata) {
    const new_court_side = cdata.new_court_side.get() || 0;
    const new_court_end = cdata.new_court_end.get() || 0;
    const new_upper_level = cdata.new_upper_level.get() || 0;
    const new_vip = cdata.new_vip.get() || 0;

    return new_court_side + new_court_end + new_upper_level + new_vip;
}

function getNewSeats(seatsType) {
    const seats = 'new_'+seatsType;
    const tpl = Template.instance();

    if (typeof tpl.cdata[seats].get() !== 'undefined') {
        return tpl.cdata[seats].get();
    } else {
        return 0;
    }
}

function setNewSeats(seatsType, value) {
    const seats = 'new_'+seatsType;
    const tpl = Template.instance();

    if (typeof tpl.cdata[seats] !== 'undefined') {
        tpl.cdata[seats].set(value);
    }
}

function distributeSeats(e, tpl) {
    const arena = tpl.data.arena;
    const increase = cutils.general.formatNumberInput(tpl.$(e.target), 0, 80000) ;
    const ideal = arenaIdealDistribution(arena, increase);

    for (let sector in ideal) {
        if (ideal.hasOwnProperty(sector) && sector !== 'total') {
            setNewSeats(sector, ideal[sector]);
        }
    }

    setNewSeats('total', computeTotal(tpl.cdata));
    showSummary(tpl);
}

function showSummary(tpl) {
    const seats = allNewSeats();
    seats.total = updateHelpers.totalSeats(seats);
    if (seats.total > 0) {
        tpl.$('.cost-summary').removeClass('hid');
        tpl.$('.cost-summary').addClass('shown');
    } else {
        tpl.$('.cost-summary').addClass('hid');
        tpl.$('.cost-summary').removeClass('shown');
    }
}