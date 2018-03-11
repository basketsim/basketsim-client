function spending() {
    var api = {update, addMoney, _expenses, _income};

    /**
     * Add positive or negative value to team finances
     * Call update straight after
     * @param {ObjectId} team_id  id of team
     * @param {number}   sum      value to increase curmoney with
     */
    function addMoney(team_id, sum) {
        Teams.update({_id: team_id}, {$inc: {
            curmoney: sum
        }});

        api.update(team_id);
    }

    function update(team_id) {
        var curmoney = Teams.findOne({_id: team_id}, {fields:{curmoney: true}}).curmoney;
        var expenses = api._expenses(team_id);
        var income = api._income(team_id);
        var diff = curmoney + (income - expenses);

        Teams.update({_id: team_id}, {$set:{
            tempmoney: diff
        }});
    }

    function _expenses(team_id) {
        var ma = MarketActivity.findOne({team_id: team_id});
        if (!ma) return 0;

        var activeBids = ma.activeBids;
        if (!activeBids || activeBids.length === 0) return 0;

        var bidsValue = _.reduce(activeBids, function(sum, el){return sum + parseInt(el.bid)}, 0);
        console.log('return expenses', bidsValue, team_id);

        return bidsValue;
    }

    function _income(team_id) {
        var activeTransfers = Transfers.find({seller_id: team_id}).fetch();
        if (!activeTransfers || activeTransfers.length === 0) return 0;

        var bidsValue = _.reduce(activeTransfers, function(sum, el){
            if (el.bids.length === 0) return sum + 0;

            var bid = el.bids[el.bids.length - 1].bid;
            return sum + parseInt(bid);
        }, 0);

        console.log('return income ', bidsValue, team_id);
        return bidsValue;
    }

    return api;
}

export default spending();