import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';

Template.TransferFlag.onCreated(function () {
    this.cdata = {
        flagStatus: new ReactiveVar(null)
    };

    Meteor.call('markets:monitor:getTransferFlagStatus', this.data.transferID, (err, fstatus) => {
        if (err) {
            sAlert.error(err);
        } else {
            this.cdata.flagStatus.set(fstatus);
        }
    });
});

Template.TransferFlag.helpers({
    flaggedByThisUser: flaggedByThisUser,
    flagsCount: flagsCount,
    otherFlags: otherFlags
});

Template.TransferFlag.events({
    'click #flag-transfer': flagTransfer,
    'submit #submit-comment': submitComment
});

function flaggedByThisUser() {
    const tpl = Template.instance();
    const fs = tpl.cdata.flagStatus.get();
    if (!fs) return false;
    return fs.flaggedByThisUser;
}

function flagsCount() {
    const tpl = Template.instance();
    const fs = tpl.cdata.flagStatus.get();
    if (!fs) return 0;
    return fs.count;
}

function otherFlags() {
    var count = flagsCount();
    if (count > 1) return `and ${count - 1} others`;
    return '';
}

function flagTransfer() {
    insertFlag(this.transferID);
    changeFlagStatus();
    openCommentBox();
}

function submitComment(ev) {
    ev.preventDefault();
    const comment = $('#flag-reason').val();
    Meteor.call('markets:monitor:updateFlagReason', this.transferID, comment, function (err, succ) {
        if (err) {
            sAlert.error(err.reason);
        } else {
            sAlert.success('Thanks for providing additional details!');
            $('#comment-col').addClass('no-display');
        }
    });
}

function insertFlag(transferID) {
    Meteor.call('markets:monitor:insertFlag', transferID, (err, succ) => {
        if (err) {
            sAlert.error(err.reason);
        } else {
            sAlert.success('Thanks for flagging this transfer and helping the Basketsim community. If you wish, please write a few words on why this transfer is breaking the rules, to help the moderating team investigate this');
        }
    });
}

function changeFlagStatus() {
    var tpl = Template.instance();
    tpl.cdata.flagStatus.set({
        flaggedByThisUser: true,
        count: tpl.cdata.flagStatus.get().count + 1
    });
}

function openCommentBox() {
    $('#comment-col').removeClass('no-display');
}