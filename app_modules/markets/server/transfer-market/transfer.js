import finances from './../../../finances/server/api.js';
import news from './../../../news/server/api.js';
import userModel from './../../../user-management/server/models/user-model';

function transfer() {
    var api = {insert, cancel, bid, finish, userFlag, _create, _transferBid, _activtyBid};

    /**
     * Insert transfer in the database. Keep it at this level, so if Meteor is changed, it can be removed easily from the view
     * @return {[type]} [description]
     */
    function insert(player_id, position, startingPrice, listingDuration, callback) {
        var player = Players.findOne({_id: player_id});
        Transfers.insert(api._create(player, position, startingPrice, listingDuration), function(err, _id){
            callback(_id);
        });

        _applyTransferTax(player, startingPrice, listingDuration);
    }

    /**
     * Get active transfers that passed the deadline
     * Get latest bid, if any, and have that as the winning bid. If no bid, archive/delete transfer and return
     * Buyer id in the transfer is populated and transfer is marked as closed, after which bids are not accepted
     *
     * Players gets transfer id added to his list of transfers and swaps teams
     *
     * Buyer gets money subtracted from curmoney. Temp money are updated
     * Buyer gets news event for buying the player
     * Buyer has this transfer added to his market activity bought
     *
     * Seller gets the money added to curmoney. Tempmoney are updated.
     * Seller gets event for selling the player
     * Seller adds transfer to market activity sold
     *
     * Transfer is archived
     */
    function finish() {
        var transfers = Transfers.find({'timestamps.expire': {$lt: moment().valueOf()}}).fetch();
        var lastBid = {};
        _.each(transfers, function(t){

            if (t.bids.length === 0) {
                _closeTransfer(t, null)
                _updatePlayer(t, null);
                _removeTransfer(t._id);
            } else {
                lastBid = t.bids[t.bids.length-1];
                _closeTransfer(t, lastBid);
                _createTransferArchive(t._id);
                _updatePlayer(t, lastBid);
                _updateBuyer(t, lastBid);
                _updateSeller(t, lastBid);
                _removeTransfer(t._id);
            }
        });
    }

    /**
     * Apply 3.5% tax of listing value
     */
    function _applyTransferTax(player, startingPrice, listingDuration) {
        var tax = Math.round(startingPrice * 0.035);
        Teams.update({_id: player.team_id}, {$inc: {curmoney: -tax}});
        news.game.playerListed(player, startingPrice, tax, listingDuration);
    }

    function _closeTransfer(t, lastBid) {
        var winnerID = null;
        var bid = 0;
        var playerSold = false;
        var winnerName = null;

        if (lastBid !== null) {
            winnerID = lastBid.bidder_id;
            bid= lastBid.bid;
            playerSold = true;
            winnerName = lastBid.bidder_name;
        };

        Transfers.update({_id: t._id}, {$set:{
            buyer_id: winnerID,
            'price.end': bid,
            'state.ended': true,
            'state.playerSold': playerSold
        }});
    }

    function _createTransferArchive(transferID) {
        var t = Transfers.findOne({_id: transferID});
        TransfersArchive.insert(t);
    }

    function _removeTransfer(transferID) {
        Transfers.remove({_id: transferID});
    }

    /**
     * Change team id
     * Set null as transfer_id, as the transfer is inactive
     * Push transfer to the list of player transfers
     */
    function _updatePlayer(t, lastBid) {
        if (lastBid) {
            Players.update({_id: t.player._id}, {$push:{transfers: t._id}, $set:{
                team_id: lastBid.bidder_id,
                transfer_id: null,
                isonsale: false
            }});
        } else {
            Players.update({_id: t.player._id}, {$push:{transfers: t._id}, $set:{
                transfer_id: null,
                isonsale: false
            }});
        }
    }

    /**
     * Buyer gets money subtracted from curmoney. Temp money are updated
     * Buyer gets news event for buying the player
     * Buyer has this transfer added to his market activity bought
     */
    function _updateBuyer(t, lastBid) {
        Teams.update({_id: lastBid.bidder_id}, {$inc:{curmoney: -lastBid.bid}});
        MarketActivity.update({team_id: lastBid.bidder_id}, {$push: {'transfers.bought': t._id},
                                                            $pull: {activeBids: {'transfer_id': t._id}} });
        news.game.playerBought(lastBid.bidder_id, t.player, t.seller_id, lastBid.bid);
    }

    /**
     * Seller gets the money added to curmoney. Tempmoney are updated.
     * Seller gets event for selling the player
     * Seller adds transfer to market activity sold
     */
    function _updateSeller(t, lastBid) {
        Teams.update({_id: t.seller_id}, {$inc:{curmoney: lastBid.bid}});
        MarketActivity.update({team_id: t.seller_id}, {$push: {'transfers.sold': t._id}});
        news.game.playerSold(t.seller_id, t.player, lastBid.bidder_id, lastBid.bid);
    }

    function _create(player, position, startingPrice, listingDuration) {
        var transfer = {};

        transfer = {
            player: player,
            player_id: player._id,
            position: position,
            seller_id: player.team_id,
            buyer_id: null,
            buyer_name: null,
            bids: [],
            flags: [],
            state: {
                started: true,
                cancelled: false,
                playerSold: false,
                ended: false,
                archivedAndSanitised: false
            },
            price: {
                start: startingPrice,
                end: startingPrice,
                estimate: 0
            },
            timestamps: {
                listing: moment().valueOf(),
                expire: moment().add(listingDuration, 'days').valueOf(),
                ended: moment().add(listingDuration, 'days').valueOf()
            },
            penalty: {
                flaggedByAdmin: false,
                transferReverted: false,
                priceCorrection: 0
            }
        }

        return transfer;
    }

    function cancel(_id) {
        var cancelled = Transfers.findOne({_id: _id});
        Players.update({_id: cancelled.player._id}, {$set:{transfer_id:null}});
        var lastBidTeam = null;
        if (cancelled.bids) cancelled.bids[cancelled.bids.length-1];

        Transfers.remove({_id: _id});

        cancelled.player = {
            _id: cancelled.player._id
        };
        cancelled.buyer_id = null;
        cancelled.state.cancelled = true;
        cancelled.state.ended = true;
        cancelled.price.end = 0;
        cancelled.timestamps.ended = moment().valueOf();

        deactivateLastBid(cancelled, true);
        TransfersArchive.insert(cancelled);

        //update finances of the bidder
        if (lastBidTeam) finances.spending.update(lastBidTeam.bidder_id);
        //update finances of the seller
        finances.spending.update(cancelled.seller_id);
    }

    function bid(transfer_id, valueInp) {
        var value = parseInt(valueInp);
        var biddingClub = UserInfo.getCurrent();
        var team = Teams.findOne({_id: biddingClub.team_id});
        var trans = Transfers.findOne({_id: transfer_id});

        _validateBid(trans, value, team, this.userId);

        var transferBid = api._transferBid(team._id, team.name, value);
        var activityBid = api._activtyBid(trans, value);
        var expire = _extendTime(trans.timestamps.expire);

        deactivateLastBid(trans);
        Transfers.update({_id: transfer_id}, {$set: {'price.end': value, 'timestamps.expire': expire}, $push:{bids: transferBid}});
        MarketActivity.update({team_id: team._id}, {$push: {bids: activityBid, activeBids:activityBid}});

        //update finances of the bidder
        finances.spending.update(team._id);
        //update finances of the seller
        finances.spending.update(trans.seller_id);
    }

    function deactivateLastBid(trans, cancelledBid) {
        var lastBid = trans.bids[trans.bids.length-1];
        if (!lastBid) return;
        var teamBidderID = lastBid.bidder_id;

        MarketActivity.update({team_id: teamBidderID}, {$pull: {activeBids: {'transfer_id': trans._id}}});

        //update finances of last bidder
        finances.spending.update(lastBid.bidder_id);
        if (!cancelledBid) news.game.wasOverbided(teamBidderID, trans.player._id, trans.player.name, trans.player.surname);
    }

    /**
     * [userFlag description]
     * @return {[type]} [description]
     */
    function userFlag(t_id) {
        if (!t_id) throw new Meteor.Error("invalid-input", "Something went wrong");
        var tr = Transfers.findOne(t_id);
        var flaggerTeamID = Teams.getByUserid(this.userId)._id;
        var lastBid = _getLastBid(tr);

        if (lastBid) {
            if (tr.bids.length > 30) return;
            Transfers.update({_id: t_id}, {$push: {flags: _createFlag(lastBid, flaggerTeamID)}});
            MarketActivity.update({team_id: lastBid.bidder_id}, {$push:{'penalties.flaggedByCommunity': _createMAFlag(flaggerTeamID, t_id)}})
        }
    }

    function _createFlag(lastBid, flaggerTeamID) {
        var flag = {
            flagger_team_id: flaggerTeamID,
            bid: lastBid,
            timestamp: moment().valueOf()
        };
        return flag;
    }

    function _createMAFlag(flaggerTeamID, t_id) {
        return {
            flagger_team_id: flaggerTeamID,
            transfer_id: t_id,
            timestamp: moment().valueOf()
        }
    }

    function _getLastBid(transferObj) {
        if (!transferObj.bids || !transferObj.bids[0]) return null;
        return transferObj.bids[transferObj.bids.length-1];
    }

    //t = 1000
    //t3 = 1000 - 3 = 995
    //actual + 3 min > t
    function _extendTime(expire) {
        var t3 = moment().add(3, 'minutes').valueOf();
        if (t3 > expire) {
            return moment(expire).add(3, 'minutes').valueOf();
        } else {
            return expire;
        }
    }

    function _transferBid(team_id, team_name, value) {
        var b = {
            bidder_id: team_id,
            bidder_name: team_name,
            bid: value,
            timestamp: moment().valueOf()
        };

        return b;
    }

    function _activtyBid(trans, value) {
        var b = {
            transfer_id: trans._id,
            seller_id: trans.seller_id,
            player_id: trans.player._id,
            player_name: trans.player.name + ' ' + trans.player.surname,
            bid: value,
            estimatedValue: trans.price.estimate,
            timestamp: moment().valueOf()
        };

        return b;
    }

    function _validateBid(trans, value, team, userID) {
        if (!trans || !team) throw new Meteor.Error("invalid-input", "Something went wrong. Transfer might not be available anymore");
        if (_hasLastBid(trans, team)) throw new Meteor.Error("has-last-bid", "You already have the highest bid");
        if (!_validMinBidValue(trans, value)) throw new Meteor.Error("bid-too-low", "Bid needs to be at least the starting price and 5% higher than last bid");
        if (!_validMaxBidValue(trans, value)) throw new Meteor.Error("bid-too-high", "Bid maximum value exceeded. Max bid is the highest value between 500.000 or 20% over the previous bid. To help, we've added the max bid in the bid box");
        if (!_teamHasMoney(value, team)) throw new Meteor.Error("not-enough-money", "You do not have enough money for this bid");
        if (!_transferIsActive(trans)) throw new Meteor.Error("transfer-not-active", "Transfer is not active anymore");
        if (!_isAccountValid(userID)) throw new Meteor.Error("account-not-validated", "You cannot bid on players before you verify your email address");
        if (_isTransferBanned(team)) throw new Meteor.Error("transfer_banned", "You cannot bid on players while you are banned from the market");
    }

    /**
     * Bid has to be at least 5% more than previous
     * */
    function _validMinBidValue(trans, value) {
        if (trans.bids.length === 0) {
            if (value >= trans.price.start) {
                return true;
            } else {
                return false;
            }
        } else {
            if (value >= trans.price.end * 1.05) {
                return true;
            } else {
                return false;
            }
        }
    }

    /**
     * Bid max is the highest between 500.000 and 20% of previous bid
     * */
    function _validMaxBidValue(trans, value) {
        const minValue = trans.price.end + 500000;
        const pcgValue = trans.price.end * 1.20;
        const maxValue = (minValue > pcgValue) ? minValue : pcgValue;

        return (value <= maxValue);
    }

    function _isTransferBanned(team) {
        if (team.transfer_banned && team.transfer_banned.remaining > 0) return true;
        return false;
    }

    /*Team needs to have enough spending money*/
    function _teamHasMoney(value, team) {
        if (team.curmoney + 3000000 - value >= 0) {
            return true;
        } else {
            return false;
        }
    }

    /*Transfer has to be active*/
    function _transferIsActive(trans) {
        if (trans.state.cancelled || trans.state.ended) {
            return false;
        } else {
            return true;
        }
    }

    function _isAccountValid(userID) {
        return userModel.isAccountVerified(userID);
    }

    function _hasLastBid(trans, team) {
        var lastBid = trans.bids[trans.bids.length-1];
        if (!lastBid) return false;
        if (lastBid.bidder_id._str === team._id._str) {
            return true;
        } else {
            return false;
        }
    }

    return api;
}

export default transfer();