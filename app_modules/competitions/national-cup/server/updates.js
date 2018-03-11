import create from './create.js';
import finances from './../../../finances/server/api.js';
import financeModel from './../../../finances/server/models/finance-model.js';
import players from './../../../players/server/api.js';

function updates() {
    var api = {updateMatch, _setFinished, _updateCup, _updateAttendanceMoney, _cupInfo, _addNewRound, _getWinnerID, _updateExperience};

    function updateMatch(match) {
        var cup = NationalCups.findOne({_id: match.competition._id});

        api._updateCup(cup, api._getWinnerID(match));
        api._updateAttendanceMoney(match);
        api._updateExperience(match);
        api._setFinished(match);
    }

    function _setFinished(match) {
        Matches.update({_id: match._id}, {$set:{'state.finished':true}});
    }

    /**
     * Add winner to winners list. Increment matchesPlayedCounter
     * If no matches remaining to be played, add new round
     *
     */
    function _updateCup(cup, winnerID) {
        var ci = _cupInfo(cup);
        var setter = {};
        var push = {};

        setter['seasons.'+ci.cs+'.rounds.'+ci.cr+'.matchesPlayed'] = ci.round.matchesPlayed + 1;
        push['seasons.'+ci.cs+'.rounds.'+ci.cr+'.winners'] = winnerID;

        NationalCups.update({_id: cup._id}, {$set: setter, $push: push}, function(){
            api._addNewRound(cup._id);
        });

    }

    function _getWinnerID(match) {
        var winner = '';

        if (match.homeTeam.matchRatings.score > match.awayTeam.matchRatings.score) {
            winner = match.homeTeam.id;
        } else {
            winner = match.awayTeam.id;
        }

        return winner;
    }

    function _updateAttendanceMoney(match) {
        var income = 0;
        var eachTeamIncome = 0;
        var att = match.attendance;
        var homeTeam_id = match.homeTeam.id;
        var awayTeam_id = match.awayTeam.id;
        //revenue per seat
        var rps = {
            cs: 15,
            ce: 20,
            ul: 20,
            vip: 100
        };

        if (!att.courtSide) att.courtSide = 0;
        if (!att.courtEnd) att.courtEnd = 0;
        if (!att.upperLevel) att.upperLevel = 0;
        if (!att.vip) att.vip = 0;

        income = att.courtSide * rps.cs + att.courtEnd * rps.ce + att.upperLevel * rps.ul + att.vip * rps.vip;
        eachTeamIncome = Math.floor(income/2);

        if (eachTeamIncome) {
            Teams.update({_id: {$in:[homeTeam_id, awayTeam_id]}}, {$inc:{curmoney: eachTeamIncome}}, function(){
                financeModel.logAttendanceIncome(homeTeam_id, eachTeamIncome);
                financeModel.logAttendanceIncome(awayTeam_id, eachTeamIncome);
                finances.spending.update(homeTeam_id);
                finances.spending.update(awayTeam_id);
            });
        }
    }

    function _addNewRound(cupID) {
        var cup = NationalCups.findOne({_id: cupID});
        var ci = _cupInfo(cup);
        console.log('ci.round.matchesPlayed after every update', ci.round.matchesPlayed, ci.round.matches.length);
        if (ci.round.matchesPlayed === ci.round.matches.length) {
            create.scheduleRound(cup);
        } else if (ci.round.matchesPlayed > ci.round.matches.length) {
            console.log('trigger error');
        }
    }

    /**
     * Updates experience of all starting five players involved in the match by delegatin to the players module
     */
    function _updateExperience(match) {
        players.experience.add(match);
    }

    /**
     * Helper function for easily accesing cup properties
     * @param  {object} cup [description]
     * @return {object.cs}  current season int
     * @return {object.cr}  current round int
     * @return {object.season}  current season object
     * @return {object.round}  current round object
     */
    function _cupInfo(cup) {
        var cs = cup.currentSeason;
        var cr = cup.seasons[cs].state.nextRound;
        return {
            cs: cs,
            cr: cr,
            season: cup.seasons[cs],
            round: cup.seasons[cs].rounds[cr]
        }
    }

    return api;
}

export default updates();