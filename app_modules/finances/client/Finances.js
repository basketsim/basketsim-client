import teamModel from './../../teams/client/models/team-clientmodel.js';
import cbutils from './../../utils/client/api.js';

import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session';
import { Transfers, MarketActivity } from './../../../collections/collections.js';
import _ from 'underscore';
import { $ } from 'meteor/jquery';

Template.Finances.onCreated(function(){
    this.cdata = {
        team: new ReactiveVar(null),
        data: new ReactiveVar(null)
    };

    updateData(this);
});

Template.Finances.onRendered(function(){
    Meteor.subscribe('own-transfers');
    Meteor.subscribe('own-market-activity');

    $('[data-toggle="popover"]').popover({
        container: 'body'
    });
});

Template.Finances.helpers({
    team: function(){
        var tpl = Template.instance();
        return tpl.cdata.team.get();
    },
    dotify: cbutils.general.dotify,
    status: getFinanceStatus,
    offers: offers,
    sentBids: sentBids
});

function updateData(tpl) {
    teamModel.getOwn(function(team){
        tpl.cdata.team.set(team);

        teamModel.getFinanceData(team._id, function(financeData){
            tpl.cdata.data.set(financeData);
        });
    });
}

function getFinanceStatus() {
    var tpl = Template.instance();
    var data = tpl.cdata.data.get();
    return data;
}

function offers() {
    var team = Session.get('team');
    var cbids = [];
    if (!team) return cbids;

    var transfers = Transfers.find({seller_id: team._id}).fetch();
    _.each(transfers, function(t){
        if (t.bids && t.bids.length > 0) {
            let lastBid = t.bids[t.bids.length-1];
            cbids.push({
                player: {
                    _id: t.player._id,
                    name: t.player.name + ' ' + t.player.surname
                },
                bid: lastBid.bid
            });
        }
    });

    return cbids;
}

function sentBids() {
    var team = Session.get('team');
    var cbids = [];
    if (!team) return cbids;

    var bids = MarketActivity.findOne({team_id: team._id});
    if (!bids || bids.length === 0 || !bids.activeBids) return cbids;
    bids = bids.activeBids;

    _.each(bids, function(bid){
        cbids.push({
            player: {
                _id: bid.player_id,
                name: bid.player_name
            },
            bid: bid.bid
        });
    });

    return cbids;
}