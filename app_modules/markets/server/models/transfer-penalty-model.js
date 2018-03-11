/**
 * More info: https://gitlab.com/Basketsim/basketsim/wikis/transfer-penalties
 */
import {TransferPenalties} from './../../../../collections/collections.js';
import Teams from './../../../../collections/Teams.js';
import news from './../../../news/server/game.js';
import userModel from './../../../user-management/server/models/user-model.js';

function transferPenaltyModel() {
    var api = {create, insert, isBidderPenalised};

    function create(teamID, penalty, penaltyText, transfer, adminID, previousPenalties) {
        const penaltyInfo = getPenaltyInfo(penalty, previousPenalties);
        var penaltyObj = {
            transfer_id: transfer._id,
            seller_team_id: transfer.seller_id,
            penalised_team_id: teamID,
            penalty: penaltyInfo.finalPenalty,
            banned_for: penaltyInfo.banned_for,
            gm_userinfo_id: adminID,
            sanction_reason: penaltyText,
            user_appeal: '',
            appeal_handler_userinfo_id: null,
            appeal_accepted: false,
            appeal_answer: '',
            date: new Date()
        };

        return penaltyObj;
    }

    function insert(teamID, penalty, penaltyText, transfer, adminID) {
        const previousPenalties = TransferPenalties.find({penalised_team_id: teamID}).fetch();
        const penaltyObj = create(teamID, penalty, penaltyText, transfer, adminID, previousPenalties);
        TransferPenalties.insert(penaltyObj);

        if (penaltyObj.banned_for) {
            const team = Teams.findOne({_id: teamID}, {fields: {transfer_banned: 1}});
            const length = penaltyObj.banned_for + team.transfer_banned.remaining;
            Teams.update({_id: teamID}, {
                $set: {
                    'transfer_banned.date': penaltyObj.date,
                    'transfer_banned.length': length,
                    'transfer_banned.remaining': length,
                }
            });
        }

        if (penaltyObj.penalty === 'lock') userModel.lockByTeamID(teamID);

        news.penalty(teamID, transfer._id, penaltyObj.penalty);

        return penaltyObj;
    }

    function isBidderPenalised(transferID, penalisedTeamID) {
        const penalty = TransferPenalties.findOne({transfer_id: transferID, penalised_team_id: penalisedTeamID});
        if (penalty) return true;
        return false;
    }

    /**
     * A team can be warned only 3 times. Any warn after gets transformed into a ban
     * Bans increase by 15 days compared to the previous
     * Suspension is applied for very serious offenses, repeated offenders or new teams that look to be created just for cheating purposes.
     * @param penalty
     * @param previousPenalties
     * @returns {{finalPenalty: string, banned_for: number}}
     */
    function getPenaltyInfo(penalty, previousPenalties) {
        const penaltyInfo = {
            finalPenalty: penalty,
            banned_for: 0
        };

        const penalties = _.countBy(previousPenalties, function(penalty) {
            return penalty.penalty;
        });

        if (!penalties.warn) penalties.warn = 0;
        if (!penalties.ban) penalties.ban = 0;

        switch (penalty) {
            case 'warn':
                if (penalties.warn >= 3) {
                    ban();
                }
                break;
            case 'ban':
                ban();
                break;
        }

        function ban() {
            penaltyInfo.finalPenalty = 'ban';
            penaltyInfo.banned_for = (penalties.ban + 1) * 15;
        }

        return penaltyInfo;
    }

    return api;
}

export default transferPenaltyModel();