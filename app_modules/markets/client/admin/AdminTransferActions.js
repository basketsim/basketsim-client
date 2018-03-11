import {Template} from 'meteor/templating';
import cutils from './../../../utils/client/api';
import { Meteor} from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';

Template.AdminTransferActions.onCreated(function () {
    var self = this;
    this.cdata = {
        priceCorrection: new ReactiveVar(0), //use 0 because that's the default value in the db
        transferReverted: new ReactiveVar(false),
        transferStopped: new ReactiveVar(false)
    };
    this.autorun(function () {
        var transfer = self.data.transfer.get();
        if (transfer) {
            self.cdata.priceCorrection.set(transfer.penalty.priceCorrection);
            self.cdata.transferReverted.set(transfer.penalty.transferReverted);
        }
    });
});

Template.AdminTransferActions.events({
    'change #adjust-price': adjustPrice,
    'click #cancel-transfer': cancelTransfer,
    'click #stop-transfer': stopTransfer
});

Template.AdminTransferActions.helpers({
    percentage: percentage,
    dotify: cutils.general.dotify,
    isOriginalPrice: isOriginalPrice,
    isTransferCancelled: isTransferCancelled,
    transferObj: transferObj,
    isTransferStopped: isTransferStopped
});

function percentage(perc, value) {
    const sum = Math.round(perc * value);
    return cutils.general.dotify(sum);
}

function stopTransfer() {
    var tpl = Template.instance();
    Meteor.call('markets:admin:stopTransfer', tpl.data.transfer.get()._id, function (err, res) {
        if (err) {
            sAlert.error(err.reason);
        } else {
            tpl.cdata.transferStopped.set(true);
            sAlert.success('Transfer has been stopped. Now you can score the flag to mark it as solved');
        }
    });
}

function transferObj() {
    var tpl = Template.instance();
    return tpl.data.transfer.get();
}

function cancelTransfer() {
    var tpl = Template.instance();
    Meteor.call('markets:admin:cancelTransfer', tpl.data.transfer.get()._id, function (err, res) {
        if (err) {
            sAlert.error(err.reason);
        } else {
            tpl.cdata.transferReverted.set(true);
            sAlert.success('Transfer has been cancelled. Now you can score the flag to mark it as solved');
        }
    });
}

function adjustPrice(ev, tpl) {
    Meteor.call('markets:admin:adjustPrice', tpl.data.transfer.get()._id, parseFloat(ev.target.value), function (err, res) {
        if (err) {
            sAlert.error(err.reason);
        } else {
            tpl.cdata.priceCorrection.set(1);
            sAlert.success('Transfer has been adjusted. Now you can score the flag to mark it as solved');
        }
    });
}

function isOriginalPrice() {
    var tpl = Template.instance();
    if (!tpl.cdata.priceCorrection.get()) return true;
    return false;
}

function isTransferCancelled() {
    var tpl = Template.instance();
    return tpl.cdata.transferReverted.get();
}

function isTransferStopped() {
    var tpl = Template.instance();
    return tpl.cdata.transferStopped.get();
}