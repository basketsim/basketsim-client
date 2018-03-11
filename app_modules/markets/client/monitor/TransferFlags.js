import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';

import moment from 'moment';

Template.TransferFlags.onCreated(function () {
    var self = this;
    self.cdata = {
        flags: new ReactiveVar([])
    }
    Meteor.call('markets:monitor:getFlags', function (err, flags) {
       if (err) {
           sAlert.error(err.reason);
       } else {
           self.cdata.flags.set(sortFlags(flags));
       }
    });
});

Template.TransferFlags.helpers({
    flags: getFlags,
    date: date
});

Template.TransferFlags.events({
    'click .send-flag': sendFlag
});

function sendFlag(e) {
    var tpl = Template.instance();
    const rating = tpl.$(e.target).data('flag');
    console.log('this', this);
    Meteor.call('market:admin:rateFlag', rating, this._id, (err, succ) => {
        if (err) {
            sAlert.error(err.reason);
        } else {
            sAlert.success('Flag was closed and rated. Thanks!');
            tpl.$('#'+this._id._str).hide();
        }
    });
}

function getFlags() {
    var tpl = Template.instance();
    return tpl.cdata.flags.get();
}

function date(date) {
    return moment(date).format('DD/MM/YYYY hh:mm');
}

function sortFlags(flags) {
    const sortedFlags = [];
    flags.forEach(function (flag) {
        let foundDuplicate = false;
        sortedFlags.forEach(function (sorted) {
            if (flag.transfer_id._str === sorted.transfer_id._str) {
                foundDuplicate = true;
                sorted.flags.push({
                    _id: flag._id,
                    flagger_userinfo_id: flag.flagger_userinfo_id,
                    flagger_comment: flag.flagger_comment,
                    flag_score: flag.flag_score,
                    scorer_user_id: flag.scorer_user_id,
                    date: flag.date
                });
            }
        });

        if (!foundDuplicate) {
            sortedFlags.push({
                _id: flag._id,
                transfer_id: flag.transfer_id,
                flags: [{
                    _id: flag._id,
                    flagger_userinfo_id: flag.flagger_userinfo_id,
                    flagger_comment: flag.flagger_comment,
                    flag_score: flag.flag_score,
                    scorer_user_id: flag.scorer_user_id,
                    date: flag.date
                }]
            });
        }
    });

    return sortedFlags;
}