/** This is duplicate functionality. yay */
function finance() {
    var api = {updateTempMoney, _update, _bidIncome, _bidExpenses};

    function updateTempMoney(teamID) {
        var team = Teams.findOne({_id: teamID}, {fields:{curmoney:1}});
        var bidIncome = api._bidIncome(team);
        var bidExpenses = api._bidExpenses(team);
        var sum = bidIncome - bidExpenses;

        api._update(sum, team);
    }

    function _update(sum, team) {
        var diff = team.curmoney + sum;
        Teams.update({_id: team._id}, {$set: {tempmoney: diff}});
    }

    function _bidIncome(team) {
        var sum = 0;
        var transfers = Transfers.find({seller_id: team._id}).fetch();
        _.each(transfers, function(t){
            if (t.bids && t.bids.length > 0) {
                let lastBid = t.bids[t.bids.length-1];
                sum = sum + lastBid.bid;
            }
        });

        return sum;
    }

    function _bidExpenses(team) {
        var sum = 0;
        var bids = MarketActivity.findOne({team_id: team._id}).activeBids;

        _.each(bids, function(bid){
            sum = sum + bid.bid
        });

        return sum;
    }

    return api;
}

export default finance();