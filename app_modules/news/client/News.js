var events = new ReactiveVar([]);

var denominations = ['none', 'pathetic', 'terrible', 'poor', 'below average', 'average', 'above average', 'good', 'very good', 'great', 'extremely great',
                    'fantastic', 'amazing', 'extraordinary', 'magnificent', 'phenomenal', 'sensational', 'miraculous', 'legendary', 'magical', 'perfect'];

Template.News.onRendered(function () {
    _getLatestEvents();
});

Template.News.helpers({
    eventsList: function () {
        return events.get('data');
    },
    date: function() {
        return moment(this.timestamp).calendar();
    },
    text: text
});

function _getLatestEvents() {
    Meteor.call('getLatestEvents', function (error, result) {
        // console.log('getLatestEvents', error, result);
        if (error) {
            if (location.pathname !== '/create-club') sAlert.error(error.reason);
        } else {
            events.set(result);
        }
    });
}

function text() {
    var generators = {
        'youth-added': youthAdded,
        'training-occured': trainingOccured,
        'youth-training-finished': youthTrainingOccured,
        'match-played': matchPlayed,
        'player-sold': playerSold,
        'player-bought': playerBought,
        'player-listed': playerListed,
        'overbid': overbid,
        'player-growth': playerGrowth,
        'league-end': leagueEnd,
        'league-end-fans': leagueEndFans,
        'cup-end': cupEnd,
        'playoff-scheduled': playoffScheduled,
        'team-promoted': teamPromoted,
        'report-abuse': abuseReported,
        'finance-update': financeUpdate,
        'transfer-adjusted': transferAdjusted,
        'transfer-cancelled': transferCancelled,
        'transfer-cancelled-buyer': transferCancelledBuyer,
        'penalty': penalty,
        'transfer-stopped': transferStopped,
        'arena-upgrade': arenaUpgrade,
        'arena-upgrade-cancellation': arenaUpgradeCancellation,
        'arena-upgrade-finished': arenaUpgradeFinished,
        'fans-return': fansReturn,
    };
    return generators[this.type](this);
}

function youthAdded(e) {
    return "<a href=/players/" + e.info.player._id._str + ">" + e.info.player.name + ' ' + e.info.player.surname + "</a>" + " has joined your youth academy";
}

function fansReturn(e) {
  return `${e.info.fans} have returned supporting your club after a mysterious man have tracked them down and convinced them that burning their supporter cards was a mistake.`;
}

function trainingOccured() {
    return "Training occured. Check" + "<a href='./players'>" + " your players " + "</a>" + "to see their progress."
}

function youthTrainingOccured(e) {
    return "Your youth player, <a href=/players/" + e.info.player_id._str + ">" + e.info.name + ' ' + e.info.surname + "</a>" + " finished training. His <strong>" + e.info.skill + "</strong> ability is <strong>" + denominations[Math.floor(e.info.value/8)] + '</strong>.'
}

function matchPlayed(e) {
    var ownerTeamID = Session.get('team')._id;
    var result = '';
    var score = '';
    var opponent = '';
    var competitions = {
        Leagues: 'league',
        NationalCups: 'cup',
        Playoffs: 'playoff'
    };

    var match = "<a href=/matches/" + e.info.match._id + ">" + " match " + "</a>";

    (ownerTeamID._str === e.info.match.winner_id._str) ? (result = "You've won") : (result = "You've lost");
    var fans = (ownerTeamID._str === e.info.match.winner_id._str) ? `${e.info.match.winner_fans} people joined your fan club` :
      `${e.info.match.loser_fans * -1} fans burned their memberships cards`;

    if (ownerTeamID._str === e.info.home._id._str) {
        score = "(" + e.info.home.score + ' - ' + e.info.away.score + ")";
        opponent = "<a href=/teams/" + e.info.away._id + ">" + e.info.away.name + "</a>";
    } else {
        score = "(" + e.info.away.score + ' - ' + e.info.home.score + ")";
        opponent = "<a href=/teams/" + e.info.home._id + ">" + e.info.home.name + "</a>";
    }

    return result + " " + score + " a " + competitions[e.info.match.competition] + match + " against " + opponent + '. ' + fans;
}

function playerSold(e) {
    var player = _a('/players/', e.info.player._id, e.info.player.name);
    var team = _a('/teams/', e.info.buyer._id, e.info.buyer.name);
    return player + ' has been sold to ' + team + ' for ' + e.info.sum + '$';
}

function playerBought(e) {
    var player = _a('/players/', e.info.player._id, e.info.player.name);
    var team = _a('/teams/', e.info.seller._id, e.info.seller.name);
    return 'You have bought ' + player + ' from ' + team + ' for ' + e.info.sum + '$';
}

function playerListed(e) {
    var player = _a('/players/', e.info.player._id, e.info.player.name);
    return "You've listed " + player + " on the market for " + e.info.listingDuration + " days, with the starting price at " + e.info.startingPrice + "$. The auctioneer has been paid " + e.info.tax + "$ for her services."
}

function overbid(e) {
    var player = _a('/players/', e.info.player._id, e.info.player.name);
    return "A higher bid than yours has been placed for " + player;
}

/** Your staff brought you a list on the physical development of your young players
        * [Player name] grew [growth] cm
        * [Player name] grew [growth] cm
*/
function playerGrowth(e) {
    var intro = 'Your staff brought you a list on the physical development of your young players: <br><ul>';
    _.each(e.info.growth, function(g){
        intro = intro + '<li>' + _a('/players/', g.player._id, g.player.name + ' ' + g.player.surname) + ' has grown ' + g.growth + ' cm and gained ' + g.weight + ' kg.' + '</li>';
    });
    intro = intro + '</ul>';
    return intro;
}

function leagueEnd(e) {
    var sum = butils.general.dotify(e.info.reward);
    var place = '1st';
    switch(e.info.place) {
        case 1: place = '1st'; break;
        case 2: place = '2nd'; break;
        case 3: place = '3rd'; break;
        default: place = e.info.place + 'th';
    }

    var txt = "You've received " + sum + " for finishing the season on " + place + " place, in " + e.info.leagueName +", " +
    e.info.country + ". <br/> Good luck in the new season!";

    return txt;
}

function leagueEndFans(e) {
    var txt = '';
    if (e.info.reward > 0) {
        txt = `Inspired by your recent league performance, ${e.info.reward} fans have joined your fanclub`
    } else {
        txt = `Unfortunately, your latest league results made ${e.info.reward * -1} fans decide to stop their fanclub membership`
    }
    return txt;
}

function cupEnd(e) {
    var texts = {
        'winner': 'winning the National Cup! Congratulations!',
        'final': 'reaching the final of the National Cup!',
        'semi final': 'reaching the semi-finals of the National Cup.',
        'quarter final': 'reaching the quarter-finals of the National Cup.'
    };
    var reason = '';
    if (texts[e.info.roundResult]) {
        reason = texts[e.info.roundResult];
    } else {
        reason = 'reaching ' + e.info.roundResult + ' of the National Cup.'
    }

    var reward = butils.general.dotify(e.info.reward);

    var txt = `You've received ${reward}$ for ${reason} ${e.info.fans} fans joined your fanclub inspired by this performance!`;

    return txt;
}
/*Playoff match has been scheduled against {{opponent}}. Good luck!*/
function playoffScheduled(e) {
    return `Playoff match has been scheduled against ${_a('/teams/', e.info.opponent._id, e.info.opponent.name)}. Good luck!`
}

function teamPromoted(e) {
    return `Congratulations!!! Your team has promoted to the next higher league! Ready to face new opponents?`
}

function financeUpdate(e) {
    var text = `Your accountant brought the financial report for the week: <br><ul>`;
    text = text + `<li> Salary expenses: ${butils.general.dotify(e.info.salaries)} </li>`;
    text = text + `<li> Cheerleaders expenses: ${butils.general.dotify(e.info.cheerleaders)} </li>`;
    text = text + `<li> Sponsors income: ${butils.general.dotify(e.info.sponsors)} </li>`;
    text = text + `<li> Advertising income: ${butils.general.dotify(e.info.advertising)} </li>`;
    text = text + `<li> Weekly balance: ${butils.general.dotify(e.info.balance)} </li>`;
    text = text + `</ul>`;

    return text;
}

function transferAdjusted(e) {
    var transfer = _a('/transfers-history/', e.info.transferID._str, 'Transfer');
    var text = `${transfer} has been adjusted by ${butils.general.dotify(e.info.sum)}`;

    return text;
}

function transferCancelled(e) {
    var transfer = _a('/transfers-history/', e.info.transferID._str, 'Transfer');
    var player = _a('/players/', e.info.playerID._str, 'The player');
    var text = `${transfer} has been cancelled. ${player} has returned to your team.`;

    return text;
}

function transferCancelledBuyer(e) {
    var transfer = _a('/transfers-history/', e.info.transferID._str, 'Transfer');
    var player = _a('/players/', e.info.playerID._str, 'The player');
    var text = `${transfer} has been cancelled. ${player} has returned to his original team. As penalty, your winning bid is not returned`;

    return text;
}

function penalty(e) {
    var transfer = _a('/transfers-history/', e.info.transferID._str, 'Transfer');
    var text = `Your team received a transfer ${e.info.penalty} for your bidding in ${transfer}`;

    return text;
}

function transferStopped(e) {
    var player = _a('/players/', e.info.playerID._str, e.info.playerName);

    var text = `${player}'s transfer has been cancelled due to suspicious bidding. Sorry for the inconvieniece and feel free to list the player again`;

    return text;
}

function arenaUpgrade(e) {
    const price = butils.general.dotify(e.info.price);
    const completionDate = moment(e.info.completionDate).format('DD/MM/YYYY');
    const newCapacity = butils.general.dotify(e.info.newCapacity);
    const text = `You have ordered an arena upgrade for the price of ${price}$. Work will finish on ${completionDate}. The new capacity will be ${newCapacity}`;
    return text;
}

function arenaUpgradeCancellation(e) {
    const price = butils.general.dotify(e.info.price);
    const text = `You have cancelled the building of the arena and received your money (${price}$) back.`;
    return text;
}

function arenaUpgradeFinished(e) {
    return `The building company has finished the arena construction. You can now use its full capacity again!`;
}

function abuseReported(e) {
    var admin = '<span style="color:#C4122F">Admin: </span>';
    var reporter = _a('/club/', e.info.reporter._id, e.info.reporter.name);
    var reported = _a('/teams/', e.info.reportedTeamID, e.info.reportedTeamID);

    var txt =  admin + reporter + ' reported ' + reported + ' for ' + e.info.reportedFor;

    return txt;
}

function _a(aroot, param, text) {
    return "<a href=" + aroot + param + ">" + text + "</a>";
}

