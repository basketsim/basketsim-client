import finances from './../../../finances/server/api.js';
import achievementsModel from './../../../achievements/server/model.js';
import news from './../../../news/server/game.js';
/**
 * Increase cup current season number
 * From season.state, set it to finished:true
 * Set season.state.winner to the id of the winning team or null if the cup had no teams
 * @param  {[type]} cup  [description]
 * @param  {[type]} team [description]
 * @return {[type]}      [description]
 */
function endSeason(cup, team) {
    var ci = _cupInfo(cup);
    var setter = {};
    setter['seasons.'+ci.cs+'.state.ended'] = true;
    setter['seasons.'+ci.cs+'.state.winner'] = ci.round.winners[0] || team;

    _updateTeamsOnEnd(cup, true);
    NationalCups.update({_id: cup._id}, {
        // $inc: {currentSeason:1}, Current season should be increased after the season is refreshed
        $set: setter
    });
}

function updateAllCupsOnEnd(updateDB) {
    console.log('updateAllCupsOnEnd started');
    var cups = NationalCups.find().fetch();
    // var cups = NationalCups.find({ country:'Romania' }).fetch();

    _.each(cups, function(cup, i){
        _updateTeamsOnEnd(cup, updateDB);
        console.log('updated cups', cup.country, i+1, '/', cups.length);
    });
    console.log('updateAllCupsOnEnd ended');
}
/**
 * Send news to participants
 * ** From rounds, make object that has both winners and losers. For losers, send the message and the money
 * Send trophy to winner
 * On end also assign money based on the position in the cup
 * ** The position is determined based on the number of rounds - the round in which the team have exited
 * Update fan club of all participants based on their performance
 */
function _updateTeamsOnEnd(cup, updateDB) {
    var ci = _cupInfo(cup);
    console.log('_updateTeamsOnEnd got past ci');

    _.each(ci.season.rounds, function(round, roundNumber){
        roundNumber = parseInt(roundNumber, 10);
        _addLosersToSeasonRounds(round, roundNumber, updateDB);
        _formatFinalWinner(ci, round, roundNumber, updateDB);
        _sendMoney(cup, ci, round, roundNumber, updateDB);
        _sendTrophy(cup, ci, round, roundNumber, updateDB);
        _addFans(cup, ci, round, roundNumber, updateDB);
        _sendNews(cup, ci, round, roundNumber, updateDB);
        _addToClubHistory(cup, ci, round, roundNumber, updateDB);
    });
}

function _formatFinalWinner(ci, round, roundNumber) {
    var rounds = ci.season.info.rounds;
    if (rounds !== roundNumber) return;

    var winnerStr = round.winners[0]._str;
    round.winners[0] = {_id: new Mongo.ObjectID(winnerStr)};
}

/**
 * For each round of the season, go through the teams participating and the winners to assign the losers
 * @param {[type]} season [description]
 */
function _addLosersToSeasonRounds(round, roundNumber) {
    var teams = _.map(round.teams, function(team){return team._str});
    var winners = _.map(round.winners, function(team){return team._str});
    var losers = _.difference(teams, winners);
    round.losers = _.map(losers, function(team){return {_id: new Mongo.ObjectID(team)}});
}
/**
 * Assign money to teams based on the following distribution (the round numbers are inverted, the num being the diff)
 * Winner             1.600.000
 * Runner-up          1.200.000
 * Semi-finalist      900.000
 * Quarter-finalist   600.000
 * Round 4            400.000
 * Round 5            200.000
 * Round 6            100.000
 * Round 7 and below  50.000
 *
 * @return {[type]} [description]
 */
function _sendMoney(cup, ci, round, roundNumber, updateDB) {
    var moneyAwards = [1600000, 1200000, 900000, 600000, 400000, 200000, 100000, 50000];
    var roundDiff = ci.season.info.rounds - roundNumber;

    //assign money to winner
    if (roundDiff === 0) {
        round.winners[0].money = moneyAwards[0];

        //update db
        if (updateDB) finances.spending.addMoney(round.winners[0]._id, round.winners[0].money);
    }

    //assign money for losers and send to all
    _.each(round.losers, function(loser){
        if (moneyAwards[roundDiff + 1]) {
            loser.money = moneyAwards[roundDiff + 1];
        } else {
            loser.money = moneyAwards[moneyAwards.length-1];
        }

        //update db
        if (updateDB) finances.spending.addMoney(loser._id, loser.money);
    });
}

function _sendTrophy(cup, ci, round, roundNumber, updateDB) {
    var roundDiff = ci.season.info.rounds - roundNumber;

    if (roundDiff === 0) {
        //update db
        if (updateDB) achievementsModel.insertNationalCup(cup.country, ci.cs, round.winners[0]._id);
    }
}

/**
 * Insert new event into the clubHistory obj on the userinfo collection
 */
function _addToClubHistory(cup, ci, round, roundNumber, updateDB) {
    var roundDiff = ci.season.info.rounds - roundNumber;

    if (roundDiff === 0) {
        if (updateDB) {
            UserInfo.update({team_id: round.winners[0]._id}, {$push: {clubHistory:{
                season: ci.cs,
                result: round.winners[0].result,
                date: new Date(),
                competition: {
                    collection: 'NationalCups',
                    _id: cup._id,
                    country: cup.country
                }
            }}});
        }
    }

    _.each(round.losers, function(loser){
        if (updateDB) {
            UserInfo.update({team_id: loser._id}, {$push: {clubHistory:{
                season: ci.cs,
                result: loser.result,
                date: new Date(),
                competition: {
                    collection: 'NationalCups',
                    _id: cup._id,
                    country: cup.country
                }
            }}});
        }
    });
}

function _addFans(cup, ci, round, roundNumber, updateDB) {
    var fans = [50, 40, 30, 25, 20, 15, 10, 5];
    var roundDiff = ci.season.info.rounds - roundNumber;

    //assign money to winner
    if (roundDiff === 0) {
        round.winners[0].fans = fans[0];

        //update db
        if (updateDB) {
            let arena = Arenas.findOne({team_id: round.winners[0]._id}, {fields: {fans: 1}});
            Arenas.update({team_id: round.winners[0]._id}, {
                $inc: {fans: round.winners[0].fans},
                $push: {'history.fans': {value: arena.fans, date: new Date()}}
            });
        }
    }

    //assign money for losers and send to all
    _.each(round.losers, function(loser){
        if (fans[roundDiff + 1]) {
            loser.fans = fans[roundDiff + 1];
        } else {
            loser.fans = fans[fans.length-1];
        }

        //update db
        if (updateDB) {
            let arena = Arenas.findOne({team_id: loser._id}, {fields: {fans: 1}});
            Arenas.update({team_id: loser._id}, {
                $inc: {fans: loser.fans},
                $push: {'history.fans': {value: arena.fans, date: new Date()}}
            });
        }
    });
}

/**
 * For the round passed, send news to all the losers.
 * If the round is the final, send winning message to winner
 * Convert round number to phase when needed (quarter final, semi final, final)
 * "You have reached round 2/7 during season 23 of the Romania Cup"
 * "Congratulations! You have reached the final during season 23 of the Romania Cup"
 * "Congratulations! You have won season 23 of the Romania Cup!"
 * @param  {[type]} roundNumber [description]
 * @return {[type]}             [description]
 */
function _sendNews(cup, ci, round, roundNumber, updateDB) {
    var roundDiff = ci.season.info.rounds - roundNumber;
    var roundResult = ''
    if (roundDiff === 0) {
        round.winners[0].result = 'winner';
        round.losers[0].result = 'final';

        if (updateDB) {
            news.cupEnd(round.winners[0]._id, round.winners[0].result, round.winners[0].money, round.winners[0].fans);
            news.cupEnd(round.losers[0]._id, round.losers[0].result, round.losers[0].money, round.losers[0].fans);
        }
    } else {
        _.each(round.losers, function(loser){
            if (roundDiff === 1) {
                loser.result = 'semi final';
            } else if (roundDiff === 2) {
                 loser.result = 'quarter final';
            } else {
                loser.result = 'round ' + roundNumber;
            }

            if (updateDB) news.cupEnd(loser._id, loser.result, loser.money, loser.fans);
        });
    }


}

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

export {endSeason, updateAllCupsOnEnd};