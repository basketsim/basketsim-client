import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import moment from 'moment';
import qp from 'query-parse';
import cbutils from './../../../utils/client/api.js';

const MAX_PRICE = 1000000000; //1 billion
const INITIAL_LIMIT = 200;

Template.TransfersHistory.onCreated(function(){
    var options = null;
    var skip = 0;
    var self = this;

    Session.set('transfer-archive:limit', INITIAL_LIMIT);
    self.cdata = {
        transfersCount: new ReactiveVar(0),
        transfersLimit: new ReactiveVar(0)
    };

    this.autorun(function(){
        var playerID = Session.get('tranfer-archive:player_id');
        var teamID = Session.get('tranfer-archive:team_id');
        var date = Session.get('transfer-archive:date');
        var minPrice = Session.get('transfer-archive:minPrice');
        var maxPrice = Session.get('transfer-archive:maxPrice');
        var transfersFetchLimit = Session.get('transfer-archive:limit');

        var options = {
            teamID: teamID,
            playerID: playerID,
            date: timeFrame(date),
            minPrice: parseInt(minPrice, 10),
            maxPrice: sanitizeMaxPrice(minPrice, maxPrice)
        };

        fetchAndCreate(self, options, transfersFetchLimit, skip);
    });
});

Template.TransfersHistory.onRendered(function () {
    // document.getElementById("date-select").addEventListener('change', function(){
    // });
});

Template.TransfersHistory.helpers({
    transfersCount: getTransfersCount,
    transfersLimit: getTransfersLimit,
    dotify: cbutils.general.dotify
});

Template.TransfersHistory.events({
    'click #market-filter': applyMarketFilters,
    'keyup #price-min, keyup #price-max': doDotify,
    'click #market-more': doubleLimit
});

function fetchAndCreate(self, options, limit, skip) {
    Meteor.call('markets:monitor:getTransferHistory', options, limit, skip, function(err, transfers){
        self.cdata.transfersCount.set(transfers.transfers.length);
        self.cdata.transfersLimit.set(transfers.max);

        resetTable();
        createTable(transfers.transfers);
    });
}

function doDotify(ev) {
    if (ev.target.value === '') return;
    var newVal = parseInt(cbutils.general.undotify(ev.target.value), 10);
    newVal = cbutils.general.dotify(newVal);
    if (newVal === undefined) newVal = 0;
    ev.target.value = newVal;
}

function applyMarketFilters(ev, tpl) {
    const date = tpl.$('#date-select').val()? tpl.$('#date-select').val(): 'anytime';
    var minPrice = tpl.$('#price-min').val() ? tpl.$('#price-min').val() : 0;
    var maxPrice = tpl.$('#price-max').val() ? tpl.$('#price-max').val() : 'max';

    const query = window.location.search.substring(1, window.location.search.length);
    const existingFilters = qp.toObject(query);

    var originalQuery = '';

    minPrice = cbutils.general.undotify(minPrice) || 0;
    maxPrice = cbutils.general.undotify(maxPrice);

    if (existingFilters.player !== undefined) originalQuery += `player=${existingFilters.player}&`;
    if (existingFilters.team !== undefined) originalQuery += `team=${existingFilters.team}&`;

    if (typeof parseInt(maxPrice) === "number" && parseInt(maxPrice, 10) < parseInt(minPrice, 10)) {
        sAlert.warning('Max Price was less than Min price. The value has been discarded');
        $('#price-max').val('');
        maxPrice = 'max';
    }

    Router.go(`/transfers-history?${originalQuery}date=${date}&minPrice=${minPrice}&maxPrice=${maxPrice}`);
}
/* Setting a new limit triggers a new search*/
function doubleLimit() {
    var limit = Session.get('transfer-archive:limit') * 2;
    Session.set('transfer-archive:limit', limit);
}

function sanitizeMaxPrice(minPrice, maxPrice) {
    if (maxPrice === 'max') return MAX_PRICE;
    if (typeof maxPrice === undefined) return MAX_PRICE;
    if (parseInt(maxPrice, 10) < parseInt(minPrice, 10)) {
        sAlert.warning('Max Price was less than Min price. The value has been discarded');
        $('#price-max').val('');
        return MAX_PRICE;
    }

    return parseInt(maxPrice);
}

function getTransfersCount() {
    var tpl = Template.instance();
    return tpl.cdata.transfersCount.get();
}

function getTransfersLimit() {
    var tpl = Template.instance();
    return tpl.cdata.transfersLimit.get();
}

function timeFrame(key) {
    var timestamp = 0;
    var timeframe = {
        today: moment().subtract(24, 'hours').valueOf(),
        lastThreeDays: moment().subtract(3, 'days').valueOf(),
        lastTwoWeeks: moment().subtract(2, 'weeks').valueOf(),
        lastMonth: moment().subtract(1, 'months').valueOf(),
        lastThreeMonths: moment().subtract(3, 'months').valueOf(),
        lastYear: moment().subtract(1, 'years').valueOf(),
        anytime: 0
    };

    timestamp = (timeframe[key] !== undefined) ? timeframe[key] : 0;

    return timestamp;
}

function resetTable() {
    $('#table-container').empty();
    $('#table-container').append('<table id="table" class="blue-table">');
}

function createTable(transfers) {
    transfers.forEach(function (transfer) {
        let edited = '';
        if (transfer.penalty.priceCorrection > 0) {
            edited = `<span title="Price was corrected" style="margin-left: 1px;color: #f9a744;font-size: 8px;vertical-align: super;" class="ion-asterisk"></span>`;
        }

        transfer.bidsLength = transfer.bids.length;
        transfer.ended = moment(transfer.timestamps.ended).format('DD-MM-YY, HH:mm');
        transfer.price.endFormatted = cbutils.general.dotify(transfer.price.end) + edited;
        transfer.player.evFormatted = cbutils.general.dotify(transfer.player.ev);
    });
    $('#table').bootstrapTable({
        columns: [{
            field: 'player.name',
            title: 'Player',
            titleTooltip: 'Player',
            sortable: true,
            formatter: function(value, row, index) {
                const filter = `<a title="Filter by ${value}'s transfers" style="color:#ffab40!important" href=/transfers-history?player=${row.player_id._str}> ${value} </a>`;
                const newTab = `<a title="Open ${value}'s details in a new tab" style="color:#ffffff!important" target="_blank" href=/players/${row.player_id._str}> <i class="ion-android-open"></i> </a>`;
                return newTab + ' ' + filter;
            },
            class: 'trlist table-first-row'
        },{
            field: 'player.age',
            title: 'Age',
            titleTooltip: 'Player Age',
            sortable: true,
            align: 'center'
        },{
            field: 'player.experience',
            title: 'EXP',
            titleTooltip: 'Player experience',
            sortable: true,
            align: 'center'
        },{
            field: 'player.workrate',
            title: 'WR',
            titleTooltip: 'Player workrate',
            sortable: true,
            align: 'center'
        },{
            field: 'player.ts',
            title: 'TS',
            titleTooltip: 'Player Total Skill',
            sortable: true,
            align: 'center'
        },{
            sortName: 'player.ev',
            field: 'player.evFormatted',
            title: 'EV',
            titleTooltip: 'EV',
            sortable: true,
            align: 'center'
        },{
            sortName: 'price.end',
            field: 'price.endFormatted',
            title: 'Price',
            titleTooltip: 'Price',
            sortable: true,
            align: 'center'
        },{
            field: 'seller_name',
            title: 'Seller',
            titleTooltip: 'Seller',
            sortable: true,
            align: 'center',
            formatter: function(value, row, index) {
                const filter = `<a title="Filter by ${value}'s transfers" style="color: #ffab40!important;" href=/transfers-history?team=${row.seller_id._str}>${value}</a>`;
                const newTab = `<a title="Open ${value}'s details in a new tab" style="color:#ffffff!important" target="_blank" href=/teams/${row.seller_id._str}><i class="ion-android-open"></i></a>`;
                return newTab + ' ' + filter;
            },
        },{
            field: 'buyer_name',
            title: 'Buyer',
            titleTooltip: 'Total Skill',
            sortable: true,
            align: 'center',
            formatter: function(value, row, index) {
                const filter = `<a title="Filter by ${value}'s transfers" style="color: #ffab40!important;" href=/transfers-history?team=${row.buyer_id._str}>${value}</a>`;
                const newTab = `<a title="Open ${value}'s details in a new tab" style="color:#ffffff!important" target="_blank" href=/teams/${row.buyer_id._str}><i class="ion-android-open"></i></a>`;
                if (row.buyer_id) return newTab + ' ' + filter;
                return null;
            },
        },{
            field: 'bidsLength',
            title: 'Bid Info',
            titleTooltip: 'Bid Info - click bids number for details',
            sortable: true,
            align: 'center',
            formatter: function(value, row, index) {
                var bid = `<a title="See transfer's bids" style="color: #ffffff!important;" href=/transfers-history/${row._id._str}><span class="ion-android-open"></span> ${value}</a>`;
                return bid;
            }
        },{
            field: 'ended',
            title: 'Date',
            titleTooltip: 'Transfer Date',
            sortable: true,
            align: 'center',
            class: 'table-last-row'
        }],
        data: transfers,
        classes: 'table table-striped table-no-bordered',
        pagination: true,
        showHeader: true,
        sidePagination:'client'
    });
}