Meteor.publish('coach-market', coachMarket);
Meteor.publish('transfer-player', transferPlayer)
Meteor.publish('own-transfers', ownTransfers);
Meteor.publish('own-market-activity', ownMarketActivity);

function coachMarket() {
    var coaches = Players.find({coach: 1, team_id: null});
    return coaches;
}

function transferPlayer(transfer_id) {
    return Transfers.find({_id: transfer_id});
}

function ownTransfers() {
    var team_id = Teams.getByUserid(this.userId)._id;
    // console.log('ownTransfers', team_id);
    return Transfers.find({seller_id: team_id});
}

function ownMarketActivity() {
    var team_id = Teams.getByUserid(this.userId)._id;
    // console.log('ownMarketActivity', team_id);
    return MarketActivity.find({team_id: team_id});
}

