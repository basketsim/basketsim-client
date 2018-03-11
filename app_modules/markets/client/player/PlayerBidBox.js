import {Template} from 'meteor/templating';
import {ReactiveVar} from 'meteor/reactive-var';
import teamClientModel from './../../../teams/client/models/team-clientmodel.js';
import cbutils from './../../../utils/client/api.js';
import userModel from './../../../user-management/client/models/userinfo-clientmodel';
import {store, a} from './../../../store/client/store';

Template.PlayerBidBox.onCreated(function(){
    const transfer = this.subscribe('transfer-player', this.data.player.transfer_id);
    this.cdata = {
        ownTeam: new ReactiveVar(null),
        isAccountVerified: new ReactiveVar(true)
    };
    teamClientModel.getOwn((team) => {
        this.cdata.ownTeam.set(team);
    });
    userModel.isAccountVerified((isVerified) => {
        this.cdata.isAccountVerified.set(isVerified);
    });
});

Template.PlayerBidBox.events({
    'click .cancel-transfer': cancelTransfer,
    'click .btn-bid': bid,
    'click .flag-transfer': flagTransfer,
    'keyup .mk-price': inputPrice,
    'click #send-verification-email': sendVerificationEmail
});

Template.PlayerBidBox.helpers({
    price: price,
    bidder: bidder,
    initBidValue: initBidValue,
    expireDate: expireDate,
    ownPlayer: ownPlayer,
    showCancelButton: showCancelButton,
    transferID: transferID,
    bannedStatus: bannedStatus,
    isAccountVerified: isAccountVerified
});

function transferID() {
    return this.player.transfer_id._str;
}

function sendVerificationEmail() {
    Meteor.call('profile:send-verification-email', function (err) {
        if (err) {
            sAlert.error(err.reason);
        } else {
            sAlert.success('Email verification has been sent. Check your email and also your spam box, just in case.');
        }
    });
}

function bannedStatus() {
    const team = ownTeam();
    if (!team || team.transfer_banned.remaining === 0) return {banned: false};

    return {banned: true, length: team.transfer_banned.remaining};
}

function isAccountVerified() {
    var tpl = Template.instance();
    return tpl.cdata.isAccountVerified.get();
}

function ownTeam() {
    const tpl = Template.instance();
    return tpl.cdata.ownTeam.get();
}

function inputPrice(e) {
    var v = $(e.currentTarget).val();
    v = cleanTrailingZeroes(v);
    v = cleanNonDigits(v);
    v = cbutils.general.dotify(v);
    $(e.currentTarget).val(v);
}

function cleanTrailingZeroes(x) {
    if (x.length <=1) return x;
    while(x.charAt(0) === '0') {
        x = x.substr(1);
    }
    return x;
}

function cleanNonDigits(x) {
    return x.replace(/[^0-9]/g, '');
}

function undotify(x) {
    return x.replace(/\,/g, '');
}

function price() {
    var transfer = Transfers.findOne({_id: this.player.transfer_id});
    if (transfer) return cbutils.general.dotify(transfer.price.end);
}

/*Finish this after implementing bids*/
function bidder() {
    var transfer = Transfers.findOne({_id: this.player.transfer_id});
    if (!transfer) return;
    var bidder = transfer.bids[transfer.bids.length - 1];
    if (transfer.bids.length !== 0) {
        return "<a href=/teams/" + bidder.bidder_id._str + ">" + bidder.bidder_name + "</a>";
    } else {
        return 'No bidder';
    }
}

function expireDate() {
    var transfer = Transfers.findOne({_id: this.player.transfer_id});
    if (!transfer) return;
    return moment(transfer.timestamps.expire).calendar();
}

function ownPlayer() {
    if (!Session.get('team')) return false;
    var team_id = Session.get('team')._id._str;
    if (this.player.team_id._str === team_id) {
        return true;
    } else {
        return false;
    }
}

function cancelTransfer(e) {
    e.preventDefault();
    Meteor.call('cancel-transfer', this.player._id, function(error, res){
        if (error) {
            sAlert.error(error.reason);
        } else {
            cbutils.events.fire('player:update');
            store.dispatch(a.bookmarks.BOOKMARKS_FETCH);
        }
    });
}

function initBidValue() {
    var transfer = Transfers.findOne({_id: this.player.transfer_id});
    if (!transfer) return;
    if (transfer.bids.length === 0) {
        return cbutils.general.dotify(transfer.price.start);
    } else {
        return cbutils.general.dotify(Math.round(transfer.price.end * 1.05) + 1);
    }
}

function showCancelButton() {
    var cancelTime = moment().subtract(8, 'hours').valueOf();
    var transfer = Transfers.findOne({_id: this.player.transfer_id});
    if (!transfer) return;
    var listingTime = transfer.timestamps.listing;
    if (listingTime > cancelTime) {
        return true;
    } else {
        return false;
    }
}

function bid() {
    var value = $('.mk-price').val();
    value = cleanNonDigits(value);
    value = +value.toString();
    Meteor.call('bid', this.player.transfer_id, value, (error) => {
        if (error) {
            sAlert.error(error.reason);
            if (error.error === 'bid-too-high') editBidToMax(this.player.transfer_id);
        }
    });
}

function editBidToMax(transferID) {
    const transfer = Transfers.findOne({_id: transferID});
    const price = transfer ? transfer.price.end : undefined;
    if (typeof price === 'undefined') return;
    const maxPrice = _validMaxBidValue(price);
    $('.mk-price').val(cbutils.general.dotify(maxPrice));
}

function _validMaxBidValue(price) {
    const minValue = price + 500000;
    const pcgValue = price * 1.20;
    const maxValue = (minValue > pcgValue) ? minValue : pcgValue;

    return maxValue;
}

function flagTransfer(evt) {
    evt.preventDefault();
    var transferID = Transfers.findOne({_id: this.player.transfer_id})._id;
    Meteor.call('userFlagTransfer', transferID, function(error, res){
        if (error) {
            sAlert.error(error.reason);
        } else {
            sAlert.success('Thanks for helping on keeping the transfer market clean!');
        }
    });
}