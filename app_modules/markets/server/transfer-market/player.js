import utils from './../../../utils/server/api.js'
import transfer from './transfer.js'

function player() {
    var api = {addToMarket, cancelTransfer, _validate, _validatePosition};

    /**
        Validate input
        Insert new transfer object
        Update Player to show he's on sale
     */
    function addToMarket(player_id, position, days, price) {
        _validate(this.userId, player_id, position, parseInt(days), parseInt(price));

        transfer.insert(player_id, position, price, days, function(_id){
            Players.update({_id: player_id}, {$set:{transfer_id: _id}});
        });


    }

    function cancelTransfer(player_id) {
        var player = Players.findOne({_id: player_id});
        var transferObj = Transfers.findOne({_id: player.transfer_id}, {fields: {'timestamps.listing':true}});

        _validateCancel(this.userId, player_id, transferObj.timestamps.listing);

        transfer.cancel(transferObj._id);
        Players.update({_id: player_id}, {$set:{transfer_id:null}});

    }

    function _validate(user_id, player_id, position, days, price) {
        if (!utils.validations.userOwnsPlayer(user_id, player_id)) throw new Meteor.Error("not-your-player", "The player your are trying to sell does not belong to you");
        if (!_validatePosition(position)) throw new Meteor.Error("invalid-position", position + " is not a valid position");
        if (!_validateDays(days)) throw new Meteor.Error("invalid-days", days + " is not a valid duration");
        if (!_validatePrice(Math.round(price))) throw new Meteor.Error("invalid-price", price + " is not a valid price");
        if (!_isSenior(player_id)) throw new Meteor.Error("not-senior", "Player must be in the senior squad");
        if (_isOnSale(player_id)) throw new Meteor.Error("already-on-sale", "Player is already on sale");
        if (_isTransferBanned(player_id)) throw new Meteor.Error("transfer_banned", "You cannot sell players while you are banned from transfers");

        console.log('player listed succesfuly', player_id, position, days, price);
    }

    function _validateCancel(user_id, player_id, listingTime) {
        if (!utils.validations.userOwnsPlayer(user_id, player_id)) throw new Meteor.Error("not-your-player", "The player your are trying to sell does not belong to you");
        if (_cancelTimeExpired(listingTime)) throw new Meteor.Error("too-late-to-cancel", "You cannot cancel this transfer anymore");
    }

    function _validatePosition(position) {
        var positions = ['PG', 'SG', 'SF', 'PF', 'C'];
        if (_.contains(positions, position)) {
            return true;
        } else {
            return false;
        }
    }

    function _validateDays(days) {
        var daysList = [1, 2, 3, 4, 5];
        if (_.contains(daysList, days)) {
            return true;
        } else {
            return false;
        }
    }

    function _validatePrice(price) {
        if (price >= 0 && price <= 200000000) {
            return true;
        } else {
            return false;
        }
    }

    function _isOnSale(player_id) {
        var player = Players.findOne({_id: player_id}, {fields: {transfer_id: true}});
        if (player.transfer_id) {
            return true;
        } else {
            return false;
        }
    }

    function _isSenior(player_id) {
        var player = Players.findOne({_id: player_id}, {fields: {coach: true}});
        if (player.coach === 0) return true;
        return false;
    }

    function _isTransferBanned(player_id) {
        var player = Players.findOne({_id: player_id}, {fields: {team_id: true}});
        var team = Teams.findOne({_id: player.team_id}, {fields: {transfer_banned:1}});
        if (team.transfer_banned && team.transfer_banned.remaining > 0) return true;
        return false;
    }

    function _cancelTimeExpired(listingTime) {
        var cancelTime = moment().subtract(8, 'hours').valueOf();

        if (listingTime > cancelTime) {
            return false;
        } else {
            return true;
        }
    }

    return api;
}

export default player();