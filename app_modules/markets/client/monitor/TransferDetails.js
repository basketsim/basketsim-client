import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { sAlert } from 'meteor/juliancwirko:s-alert';
import { ReactiveVar } from 'meteor/reactive-var';
import _ from 'underscore';
import cbutils from './../../../utils/client/api.js';
import moment from 'moment';

Template.TransferDetails.onCreated(function(){
    var transferID = this.data.transferID;
    var self = this;
    this.cdata = {
        transfer: new ReactiveVar(null),
        isActive: new ReactiveVar(false)
    };
    Meteor.call('markets:monitor:getTransferHistory', {transferID: this.data.transferID}, 1, 0, function(err, transfersInfo){
        if (err) {
            sAlert.error('Error fetching transfersInfo.transfers');
        } else if (!transfersInfo.transfers[0]){
            Meteor.call('markets:getTransfer', new Mongo.ObjectID(self.data.transferID), function (err, transfer) {
                if (err) {
                    sAlert.error(err.reason);
                } else {
                    console.log('transfer', transfer);
                    self.cdata.transfer.set(transfer);
                    self.cdata.isActive.set(true);
                }
            });
        } else {
            self.cdata.transfer.set(transfersInfo.transfers[0]);
        }
    });
});

Template.TransferDetails.helpers({
    bids: bids,
    dotify: cbutils.general.dotify,
    formatDate: formatDate,
    transfer: transfer,
    reactiveTransfer: reactiveTransfer,
    isAdmin: cbutils.validations.isAdmin,
    wasPriceEdited: wasPriceEdited,
    isActive: isActive,
    skillGameValue: skillGameValue
});

function skillGameValue(original) {
    return Math.floor(original/8);
}

function bids(tpl) {
    var transfer = getTransfer();
    if (!transfer) return;
    return _.sortBy(transfer.bids, 'bid').reverse();
}

function wasPriceEdited() {
    var transfer = getTransfer();
    if (!transfer) return;
    let edited = '';
    if (transfer.penalty.priceCorrection > 0) {
        edited = `<span title="Price was corrected" style="margin-left: -2px;color: #f9a744;font-size: 8px;vertical-align: super;" class="ion-asterisk"></span>`;
    }

    return edited;
}

function isActive() {
    const tpl = Template.instance();
    return tpl.cdata.isActive.get();
}

function transfer() {
    var transfer = getTransfer();
    if (!transfer) return;
    return transfer;
}

function getTransfer() {
    var tpl = Template.instance();
    return tpl.cdata.transfer.get();
}

function reactiveTransfer() {
    var tpl = Template.instance();
    return tpl.cdata.transfer;
}

function formatDate(timestamp) {
    return moment(timestamp).format('YYYY/MM/DD hh:mm:ss');
}