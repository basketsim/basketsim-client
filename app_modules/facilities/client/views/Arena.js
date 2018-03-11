import {Template} from 'meteor/templating';
import {ReactiveVar} from 'meteor/reactive-var';
import {Modal} from 'meteor/peppelg:bootstrap-3-modal';
import arenaModel from './../models/arena-clientmodel';
import arenaUpdatesModel from './../models/arena-updates-clientmodel';
import cutils from './../../../utils/client/api';
import arenaHelpers from './../../common/helpers/arena-updates-helpers';
import moment from 'moment';

Template.Arena.onCreated(function () {
    this.cdata = {
        arena: new ReactiveVar(null),
        arenaUpdate: new ReactiveVar(null)
    };

    fetchData(this.cdata);
});

Template.Arena.helpers({
    arena: getArena,
    arenaUpdate: getArenaUpdate,
    reactiveArenaUpdate: reactiveArenaUpdate,
    dotify: cutils.general.dotify,
    completionDate: completionDate,
    newCapacity: newCapacity,
    size: size
});

Template.Arena.events({
    'click #cancel-construction': cancelConstruction
});

function fetchData(cdata) {
    arenaModel.getOwn((arena) => {
       cdata.arena.set(arena);
       console.log('fetched arena', arena);
       arenaUpdatesModel.getByArenaID(arena._id, (arenaUpdate)=> {
           cdata.arenaUpdate.set(arenaUpdate);
           console.log('fetched arena update', arenaUpdate);
       });
    });
}

function getArena() {
    const tpl = Template.instance();
    const arena = tpl.cdata.arena.get();
    if (!arena) return null;
    arena.total = arena.court_side + arena.court_end + arena.upper_level + arena.vip;
    return arena;
}

function getArenaUpdate() {
    const tpl = Template.instance();
    const arenaUpdate = tpl.cdata.arenaUpdate.get();
    if (!arenaUpdate) return null;
    return arenaUpdate;
}

function reactiveArenaUpdate() {
    const tpl = Template.instance();
    const arenaUpdate = tpl.cdata.arenaUpdate;
    return arenaUpdate;
}

function size(sector, arena, arenaUpdate) {
    if (!arena) return null;
    const capacity = arenaHelpers.reducedCapacity(arena, arenaUpdate);
    return cutils.general.dotify(capacity[sector]);
}

function completionDate(arenaUpdate) {
    return moment(arenaUpdate.completion_date).add(1, 'days').format('DD/MM/YYYY');
}

function newCapacity(arenaUpdate, arena) {
    console.log('new capacity', arenaUpdate, arena);
    return cutils.general.dotify(arenaHelpers.totalSeats(arenaUpdate) + arena.total);
}

function cancelConstruction() {
    Modal.show('Modal', {
        modalName: 'Cancel Arena Update',
        modalContentName: 'CancelArenaUpdate',
        reactiveArenaUpdate: reactiveArenaUpdate()
    });
}

