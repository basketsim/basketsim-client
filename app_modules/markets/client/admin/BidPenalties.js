import {Template} from 'meteor/templating';
import {ReactiveVar} from 'meteor/reactive-var';
import {Meteor} from 'meteor/meteor';

Template.BidPenalties.onCreated(function () {
    this.cdata = {
        penalty: new ReactiveVar(null),
        wasPenalised: new ReactiveVar(false)
    };

    checkIfPenalised(this, this.data.transfer._id, this.data.bid.bidder_id);
});

Template.BidPenalties.events({
    'click #send-warning': sendWarning,
    'click #ban-team': banTeam,
    'click #lock-team': lockTeam,
    'click #submit-penalty': submitPenalty
});

Template.BidPenalties.helpers({
    'penaltyInfo': penaltyInfo,
    'wasPenalised': wasPenalised
});

function sendWarning() {
    const tpl = Template.instance();
    const penalty = 'warn';
    tpl.cdata.penalty.set({
        selectedPenalty: penalty,
        text: `You will send a warning to team ${this.bid.bidder_name}. Please explain your reasons. This text will be visible both to the user and other admins`,
        actionText: `Warn ${this.bid.bidder_name}`
    });
    showPenaltyDetails(tpl);
}

function banTeam() {
    const tpl = Template.instance();
    const penalty = 'ban';

    tpl.cdata.penalty.set({
        selectedPenalty: penalty,
        text: `You will ban team ${this.bid.bidder_name} from bidding on or listing players. Please explain your reasons. This text will be visible both to the user and other admins`,
        actionText: `Ban ${this.bid.bidder_name}`
    });
    showPenaltyDetails(tpl);
}

function lockTeam() {
    const tpl = Template.instance();
    const penalty = 'lock';

    tpl.cdata.penalty.set({
        selectedPenalty: penalty,
        text: `You will suspend team ${this.bid.bidder_name} from logging to Basketsim. The team will be deleted in a few weeks. Please explain your reasons. This text will be visible both to the user and other admins`,
        actionText: `Suspend ${this.bid.bidder_name}`
    });
    showPenaltyDetails(tpl);
}

function checkIfPenalised(tpl, transferID, penalisedTeamID) {
    Meteor.call('markets:admin:isBidderPenalised', transferID, penalisedTeamID, function (err, wasPenalised) {
        if (err) {
            tpl.cdata.wasPenalised.set(true);
            sAlert.error('There was an error fetching the bidder penalised status ' + err.reason);
        } else {
            let penalised = wasPenalised ?  true : false;
            tpl.cdata.wasPenalised.set(penalised);
        }
    });
}

function submitPenalty() {
    const tpl = Template.instance();
    const teamID = this.bid.bidder_id;
    const transferID = this.transfer._id;
    const penalty = tpl.cdata.penalty.get().selectedPenalty;
    const penaltyText = tpl.$('#penalty-reason').val();

    console.log('this', this, transferID, penalty, penaltyText);
    Meteor.call('markets:admin:applyPenalty', teamID, penalty, penaltyText, transferID, function (err) {
        if (err) {
            sAlert.error(err.reason);
        } else {
            sAlert.success('Penalty has been applied');
            tpl.cdata.wasPenalised.set(true);
            //hide the penalty boxes and display message with penalty in case the team has been penalised already for the transfer.
        }
    });
}

function penaltyInfo() {
    var tpl = Template.instance();
    return tpl.cdata.penalty.get();
}

function wasPenalised() {
    var tpl = Template.instance();
    return tpl.cdata.wasPenalised.get();
}

function showPenaltyDetails(tpl) {
    tpl.$('.penalty-details').removeClass('no-display');
}