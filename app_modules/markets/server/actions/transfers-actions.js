import { TransfersArchive, Transfers } from './../../../../collections/collections.js';
import { Teams } from './../../../../collections/Teams.js';
import financeModel from './../../../finances/server/models/finance-model.js';
import Players from './../../../../collections/Players.js';
import teamEvents from './../../../news/server/api.js';
import transferModel from './../transfer-market/transfer.js';

function transferActions() {
    var api = {adjustPrice, cancelTransfer, stopTransfer};

    /**
     * Updates the transfer in transfer archive to reflect the new information
     * Update team finance of seller to reflect this change
     * Send news to the team seller informing of the price adjustment
     * @param oldPrice
     * @param newPrice
     * @param transferID
     * @param sellerID
     */
    function adjustPrice(oldPrice, percentageOfPrice, transferID, sellerID) {
        const newPrice = parseInt(oldPrice * percentageOfPrice);
        const correction = oldPrice - newPrice;
        TransfersArchive.update({_id: transferID}, {$set:{
            'price.end': newPrice,
            'penalty.priceCorrection': correction
        }}, function (err) {
            if (!err) financeModel.adjustTransfer(sellerID, transferID, correction);
        });
    }

    /**
     * Returns player to selling club
     * Takes money away from selling club
     * transfer {price, seller_id, player_id, buyer_id}
     */
    function cancelTransfer(transfer) {
        TransfersArchive.update({_id: transfer._id}, {$set: {
            'penalty.transferReverted': true
        }}, function (err) {
            if (!err) {
                financeModel.cancelTransfer(transfer.seller_id, transfer._id, transfer.price.end, transfer.player_id);
                Players.update({_id: transfer.player_id}, {$set: {
                    team_id: transfer.seller_id
                }});
                teamEvents.game.cancelledTransferBuyer(transfer.buyer_id, transfer.player_id, transfer._id);
            }
        });
    }

    function stopTransfer(transfer) {
        teamEvents.game.stoppedTransfer(transfer.seller_id, transfer.player, transfer._id);
        transferModel.cancel(transfer._id);
    }

    return api;
}

export default transferActions();