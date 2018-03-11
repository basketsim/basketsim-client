import teamClientModel from './../../../teams/client/models/team-clientmodel.js';
import {Template} from 'meteor/templating';
import {ReactiveVar} from 'meteor/reactive-var';
import {store, a} from './../../../store/client/store';

var position = new ReactiveVar('PG');
var days = new ReactiveVar(1);
var tax = new ReactiveVar(0);

Template.PlayerSellBox.onCreated(function () {
    this.cdata = {
        ownTeam: new ReactiveVar(null)
    };
    teamClientModel.getOwn((team) => {
        this.cdata.ownTeam.set(team);
    });
});

Template.PlayerSellBox.events({
    'click .mk-player-position li a': function (evt) {
        evt.preventDefault();
        position.set($(evt.currentTarget).data('position'));
    },
    'click .days-on-market li a': function (evt) {
        evt.preventDefault();
        days.set($(evt.currentTarget).data('days'));
    },
    'click .list-player': addToMarket,
    'keyup .mk-price': inputPrice
});

Template.PlayerSellBox.helpers({
    selectedPosition: selectedPosition,
    selectedDays: selectedDays,
    auctioneerTax: auctioneerTax,
    bannedStatus: bannedStatus
});

function selectedPosition() {
    return position.get();
}

function selectedDays() {
    return days.get();
}

function bannedStatus() {
    const team = ownTeam();
    if (!team || team.transfer_banned.remaining === 0) return {banned: false};

    return {banned: true, length: team.transfer_banned.remaining};
}

function ownTeam() {
    const tpl = Template.instance();
    return tpl.cdata.ownTeam.get();
}

function inputPrice(e) {
    var v = $(e.currentTarget).val();
    v = cleanTrailingZeroes(v);
    v = cleanNonDigits(v);
    v = maxVal(v);

    setAuctioneerTax(v);

    v = dotify(v);
    $(e.currentTarget).val(v);
}

function addToMarket(evt) {
    evt.preventDefault();
    var price = $('.mk-price').val();
    price = cleanNonDigits(price);
    price = +price.toString();
    Meteor.call('addPlayerToMarket', this.player._id, position.get(), days.get(), price, function (error, result) {
        let self = this;
        if (error) {
            sAlert.error(error.reason);
        } else {
            cbutils.events.fire('player:update');
            store.dispatch(a.bookmarks.BOOKMARKS_FETCH);
        }
    });
}

function setAuctioneerTax(price) {
    tax.set(0.035 * price);
}

function auctioneerTax(price) {
    return dotify(Math.round(tax.get()));
}

function maxVal(x) {
    var max = 200000000
    if (x > max) {
        return max;
    } else {
        return x;
    }
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

function dotify(x) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return parts.join(".");
}