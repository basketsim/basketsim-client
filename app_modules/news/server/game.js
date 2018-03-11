import utils from './utils.js'
function game() {
    var api = {playerSold, playerBought, matchPlayed, playerListed, attendenceIncomeReceived,
        playerFired, youthAdded, trainingOccured, youthTrainingOccured, wasOverbided, growthReport,
        leagueEnd, leagueEndFans, cupEnd, playoffScheduled, teamPromoted, financeUpdate, wildcardReceived,
        adjustedTransfer, cancelledTransfer, cancelledTransferBuyer, penalty, stoppedTransfer, arenaUpgrade, arenaUpgradeCancellation,
        arenaUpgradeFinished, fansReturn};

    /**
     * [Player name] was sold to [Buyer name] for [sum]
     */
    function playerSold(receiver_id, player, buyer_id, sum) {
        var type = 'player-sold';
        var event = utils.newEvent('transfer', receiver_id);
        var buyerName = Teams.findOne({_id: buyer_id}, {fields: {name: true}}).name;

        if (!utils.validArgs(type, receiver_id, player, buyer_id, sum)) return;
        event.info = {
            player: {
                _id: player._id,
                name: player.name + ' ' + player.surname
            },
            buyer: {
                _id: buyer_id,
                name: buyerName
            },
            sum: sum
        };
        event.type = type;
        Events.insert(event, function(){});
    }

    /**
     * [Player name] bought from [Seller name] for [sum]
     */
    function playerBought(receiver_id, player, seller_id, sum) {
        var type = 'player-bought';
        var sellerName = Teams.findOne({_id: seller_id}, {fields: {name: true}}).name;
        var event = utils.newEvent('transfer', receiver_id);

        if (!utils.validArgs(type, receiver_id, player, seller_id, sum)) return;
        event.info = {
            player: {
                _id: player._id,
                name: player.name + ' ' + player.surname
            },
            seller: {
                _id: seller_id,
                name: sellerName
            },
            sum: sum
        };
        event.type = type;
        Events.insert(event, function(){});
    }

  function fansReturn(receiver_id, fans) {
      var type = 'fans-return';
      var event = utils.newEvent('fans-return', receiver_id);

      if (!utils.validArgs(type, receiver_id, fans)) return;
      event.info = {
          fans: fans
      };
      event.type = type;
      Events.insert(event, function(){});
  }

    /**
     * You've listed [player name] on the market for [listingDuration] days, with the starting price at [starting price]$.
     * The auctioneer has been paid [tax] for her services.
     */
    function playerListed(player, startingPrice, tax, listingDuration) {
        var type = 'player-listed';
        var event = utils.newEvent('transfer', player.team_id);

        if (!utils.validArgs(type, player, startingPrice, tax, listingDuration)) return;
        event.info = {
            player: {
                _id: player._id,
                name: player.name + ' ' + player.surname
            },
            listingDuration: listingDuration,
            startingPrice: startingPrice,
            tax: tax
        };
        event.type = type;
        Events.insert(event, function(){});
    }

    /**
     * You've won/lost [yourScore - awayScore] a [competition] [match] against [opponent]
     */
    function matchPlayed(match_id, homeTeam_id, awayTeam_id, homeScore, awayScore, competition) {
        var type = 'match-played';
        var event = {};
        var homeEvent = utils.newEvent('match', homeTeam_id);
        var awayEvent = utils.newEvent('match', awayTeam_id);
        var homeTeam = Teams.findOne({_id: homeTeam_id}, {fields: {name:true}});
        var awayTeam = Teams.findOne({_id: awayTeam_id}, {fields: {name:true}});
        var winner_id = null;

        (homeScore > awayScore) ? (winner_id = homeTeam_id) : (winner_id = awayTeam_id);


        if (!utils.validArgs(type, match_id, homeTeam_id, awayTeam_id, homeScore, awayScore, competition)) return;
        event.info = {
            match: {
                _id: match_id,
                competition: competition,
                winner_id: winner_id
            },
            home: {
                _id: homeTeam_id,
                name: homeTeam.name,
                score: homeScore
            },
            away: {
                _id: awayTeam_id,
                name: awayTeam.name,
                score: awayScore
            }
        };

        homeEvent.info = event.info;
        homeEvent.type = type;

        awayEvent.info = event.info;
        awayEvent.type = type;

        Events.insert(homeEvent);
        Events.insert(awayEvent);
    }

    /**
     * Income from [match] attendence was [sum]
     */
    function attendenceIncomeReceived(receiver_id, match_id, sum) {
        var type = 'attendence-income-received';
        var event = utils.newEvent('finances', receiver_id);

        if (!utils.validArgs(type, receiver_id, match_id, sum)) return;
        event.info = {
            match_id: match_id,
            sum: sum
        };
        event.type = type;
        // Events.insert(event, function(){});
    }

    /**
     * [player_name] was fired
     */
    function playerFired(receiver_id, player_id) {
        var type = 'player-fired';
        var event = utils.newEvent('players', receiver_id);
        if (!utils.validArgs(type, receiver_id, player_id)) return;
        event.info = {
            player_id: player_id
        };
        event.type = type;
        Events.insert(event, function(){});
    }

    /**
     * [coach_name] contract's has been renewed for [sum]
     */
    function contractRenewal(receiver_id, coach_id, sum) {
        var type = 'contract-renewal';
        var event = utils.newEvent('players', receiver_id);
        if (!utils.validArgs(type, receiver_id, coach_id, sum)) return;
        event.info = {
            coach_id: coach_id,
            sum: sum
        };
        event.type = type;
        Events.insert(event, function(){});
    }

    /**
     * [player_name] has joined your youth academy
     */
    function youthAdded(receiver_id, player_id, name, surname) {
        var type = 'youth-added';
        var event = utils.newEvent('players', receiver_id);
        if (!utils.validArgs(type, receiver_id, player_id, name, surname)) return;
        event.info = {
            receiver_id: receiver_id,
            player: {
                _id: player_id,
                name: name,
                surname: surname
            }
        };
        event.type = type;
        Events.insert(event, function(){});
    }

    /**
     * Training occured. Check your players to see their progress.
    */
    function trainingOccured(receiver_id) {
        var type = 'training-occured';
        var event = utils.newEvent('training', receiver_id);
        if (!utils.validArgs(type, receiver_id)) return;
        event.info = {
            receiver_id: receiver_id
        };
        event.type = type;
        Events.insert(event, function(){});
    }

    /**
     * Your youth player, [player name] finished training. His [skill name] ability is [value to string].
     */
    function youthTrainingOccured(receiver_id, player_id, name, surname, skill, value) {
        var type = 'youth-training-finished';
        var event = utils.newEvent('training', receiver_id);
        if (!utils.validArgs(type, receiver_id, player_id, name, surname, skill, value)) return;
        event.info = {
            receiver_id: receiver_id,
            player_id: player_id,
            name: name,
            surname: surname,
            skill: skill,
            value: value
        };
        event.type = type;
        Events.insert(event, function(){});
    }

    /** A higher bid than yours has been placed for [player name] */
    function wasOverbided(receiver_id, player_id, player_name, player_surname) {
        var type = 'overbid';
        var event = utils.newEvent('transfers', receiver_id);
        if (!utils.validArgs(type, receiver_id, player_id, player_name)) return;

        event.info = {
            receiver_id: receiver_id,
            player: {
                _id: player_id,
                name: player_name + ' ' + player_surname
            }
        };

        event.type = type;
        Events.insert(event, function(){});
    }

    /** Your staff brought you a list on the physical development of your young players
            * [Player name] grew [growth] cm
            * [Player name] grew [growth] cm
    */
    function growthReport(receiver_id, growthArray) {
        var type = 'player-growth';
        var event = utils.newEvent('players', receiver_id);
        if (!utils.validArgs(type, receiver_id, growthArray)) return;

        event.info = {
            receiver_id: receiver_id,
            growth: growthArray
        }

        event.type = type;
        Events.insert(event, function(){});
    }
    /**
     * You've received x for finishing the season on 3rd/4th... place.
     * Good luck in the new season!
     * @param  {[type]} receiver_id [description]
     * @param  {[type]} level       [description]
     * @param  {[type]} place       [description]
     * @param  {[type]} reward      [description]
     * @return {[type]}             [description]
     */
    function leagueEnd(receiver_id, leagueName, country, place, reward) {
        var type = 'league-end';
        var event = utils.newEvent('league', receiver_id);
        if (!utils.validArgs(type, receiver_id, leagueName, country, place, reward)) return;

        event.info = {
            receiver_id: receiver_id,
            leagueName: leagueName,
            country: country,
            place: place,
            reward: reward
        }

        event.type = type;
        Events.insert(event, function(){});
    }

    /**
     * Positive: Inspired by your recent league performance, x fans have joined your fanclub
     * Negative: Unfortunately, your latest league results let x fans to stop their fanclub membership
     */
    function leagueEndFans(receiver_id, leagueName, country, place, reward) {
        var type = 'league-end-fans';
        var event = utils.newEvent('league', receiver_id);
        if (!utils.validArgs(type, receiver_id, leagueName, country, place, reward)) return;

        event.info = {
            receiver_id: receiver_id,
            leagueName: leagueName,
            country: country,
            place: place,
            reward: reward
        }

        event.type = type;
        Events.insert(event, function(){});
    }

    /**
     * You've received {{money}} for {{reason}}. {{fans}} fans joined your fanclub inspired by this performance!
     * @param  {ObjectID} receiver_id UserInfo id
     * @param  {string} roundResult   Result in cup. Ex: "winner", "final", "semi-final", "round 4"
     * @param  {number} reward        Financial reward
     * @param  {number} fans          Number of fans joining the club
     */
    function cupEnd(receiver_id, roundResult, reward, fans) {
        var type = 'cup-end';
        var event = utils.newEvent('cup', receiver_id);
        if (!utils.validArgs(type, receiver_id, roundResult, reward, fans)) return;

        event.info = {
            receiver_id: receiver_id,
            roundResult: roundResult,
            reward: reward,
            fans: fans
        }

        event.type = type;
        Events.insert(event, function(){});
    }

    /**
     * Playoff match has been scheduled against {{opponent}}. Good luck!
     * @param  {ObjectID} receiver_id UserInfo id
     * @param  {string} roundResult   Result in cup. Ex: "winner", "final", "semi-final", "round 4"
     * @param  {number} reward        Financial reward
     * @param  {number} fans          Number of fans joining the club
     */
    function playoffScheduled(receiver_id, opponent, justCreate) {
        var type = 'playoff-scheduled';
        var event = utils.newEvent('playoff', receiver_id);
        if (!utils.validArgs(type, receiver_id, opponent)) return;

        event.info = {
            receiver_id: receiver_id,
            opponent: opponent
        }

        event.type = type;
        if (!justCreate) Events.insert(event, function(){});

        return event;
    }

    function teamPromoted(receiver_id, justCreate) {
        var type = 'team-promoted';
        var event = utils.newEvent('league', receiver_id);
        if (!utils.validArgs(type, receiver_id)) return;

        event.info = {
            receiver_id: receiver_id
        }

        event.type = type;
        if (!justCreate) Events.insert(event, function(){});

        return event;
    }

    function financeUpdate(receiver_id, advertising, sponsors, salaries, cheerleaders, balance) {
        var type = 'finance-update';
        var event = utils.newEvent('finance', receiver_id);
        if (!utils.validArgs(type, receiver_id)) return;

        event.info = {
            receiver_id: receiver_id,
            advertising: advertising,
            sponsors: sponsors,
            salaries: salaries,
            cheerleaders: cheerleaders,
            balance: balance
        };

        event.type = type;
        Events.insert(event, function(){});

        return event;
    }

    /**
     * Your team has received a wildcard and will play in a superior league.
     */
    function wildcardReceived(receiver_id) {
        var type = 'wildcard-received';

        var event = utils.newEvent('league', receiver_id);
        if (!utils.validArgs(type, receiver_id)) return;

        event.info = {
            receiver_id: receiver_id
        };

        event.type = type;
        Events.insert(event, function(){});

        return event;
    }

    function adjustedTransfer(teamID, transferID, sum) {
        var type = 'transfer-adjusted';

        var event = utils.newEvent('market', teamID);
        if (!utils.validArgs(type, teamID)) return;

        event.info = {
            teamID: teamID,
            transferID: transferID,
            sum: sum
        };

        event.type = type;
        Events.insert(event, function(){});

        return event;
    }

    function cancelledTransfer(teamID, transferID, playerID) {
        var type = 'transfer-cancelled';

        var event = utils.newEvent('market', teamID);
        if (!utils.validArgs(type, teamID)) return;

        event.info = {
            teamID: teamID,
            transferID: transferID,
            playerID: playerID
        };

        event.type = type;
        Events.insert(event, function(){});

        return event;
    }

    function cancelledTransferBuyer(teamID, playerID, transferID) {
        var type = 'transfer-cancelled-buyer';
        var event = utils.newEvent('market', teamID);
        if (!utils.validArgs(type, teamID, playerID)) return;
        event.info = {
            teamID: teamID,
            playerID: playerID,
            transferID: transferID
        };

        event.type = type;
        Events.insert(event, function(){});

        return event;
    }

    function penalty(teamID, transferID, penalty) {
        var type = 'penalty';
        var event = utils.newEvent('penalty', teamID);
        if (!utils.validArgs(type, teamID, transferID, penalty)) return;
        event.info = {
            teamID: teamID,
            transferID: transferID,
            penalty: penalty
        };

        event.type = type;
        Events.insert(event, function(){});

        return event;
    }

    function stoppedTransfer(teamID, player, transferID) {
        var type = 'transfer-stopped';
        var event = utils.newEvent('transfer-stopped', teamID);
        if (!utils.validArgs(type, teamID, player, transferID)) return;
        event.info = {
            teamID: teamID,
            playerID: player._id,
            playerName: player.name + ' ' + player.surname,
            transferID: transferID
        };

        event.type = type;
        Events.insert(event, function(){});

        return event;
    }

    function arenaUpgrade(teamID, price, completionDate, newCapacity) {
        var type = 'arena-upgrade';
        var event = utils.newEvent('arena-upgrade', teamID);
        if (!utils.validArgs(type, teamID, price, completionDate, newCapacity)) return;
        event.info = {
            teamID: teamID,
            price: price,
            completionDate: completionDate,
            newCapacity: newCapacity
        };

        event.type = type;
        Events.insert(event, function(){});

        return event;
    }

    function arenaUpgradeCancellation(teamID, price) {
        var type = 'arena-upgrade-cancellation';
        var event = utils.newEvent('arena-upgrade-cancellation', teamID);
        if (!utils.validArgs(type, teamID, price)) return;
        event.info = {
            teamID: teamID,
            price: price
        };

        event.type = type;
        Events.insert(event, function(){});

        return event;
    }

    function arenaUpgradeFinished(teamID) {
        var type = 'arena-upgrade-finished';
        var event = utils.newEvent('arena-upgrade-finished', teamID);
        if (!utils.validArgs(type, teamID)) return;
        event.info = {
            teamID: teamID,
        };

        event.type = type;
        Events.insert(event, function(){});

        return event;
    }

    return api;
}

export default game();