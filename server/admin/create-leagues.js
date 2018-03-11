var chance = new Chance();
var matchType;
var bst = bst || {};
Meteor.methods({
    createLeagueMatches: function (type, startDate) {
        matchType = type;
        //array of league objects
        var leagues = NatLeagues.find().fetch();
        for (var i=0; i<leagues.length; i++) {
            generateMatches(leagues[i].teams, leagues[i]._id);
        }
    }
});

function generateMatches(teamsArray, leagueId) {
    var length = teamsArray.length;
    var teams = chance.shuffle(teamsArray);
    var lastTeam;
    var matches = [];
    var returnMatches = [];
    var rounds = length - 1;
    var round;

    for (round=1; round <= rounds; round++) {
        for (var i=0; i< length/2; i++) {
            if (round % 2 !== 0) {
                matches.push(setMatch(teams[i].team_id, teams[length-(i+1)].team_id, round, leagueId)); //first half of array plays home
            } else {
                matches.push(setMatch(teams[length-(i+1)].team_id, teams[i].team_id, round, leagueId)); //second half plays away
            }
        }

        //alter teams array
        lastTeam = teams.pop();
        teams.splice(1, 0, lastTeam);
    }

    // create second leg matches
    round = round - 1;
    for (var k=0; k<matches.length; k++) {
        returnMatches.push(setMatch(matches[k].awayTeam, matches[k].homeTeam, matches[k].round + round, leagueId));
    }

    return matches.concat(returnMatches);
}

/** Incomplete function. Need to find a way to test this */
function startingDate(minDate, leagueId) {
    //check country of the league
    //get time of play from dates table based on the country of the league
    //get first date after min date
    var date = 0;
    var league = NatLeagues.find({_id: leagueId}).fetch();
    var dates = Dates.find({country: league.country}).fetch();
    return date;
}

function setMatch(home, away, round, leagueId) {
    var match = {
        homeTeam: {
            id: home
        },
        awayTeam: {
            id: away
        },
        hasPlayed: false,
        round: round,
        competition: {
            type: matchType,
            id: leagueId
        }
    };
    //insert match into collection
    Matches.insert(match);

    return match;
}

//make functions public for testing
bst.startingDate = startingDate;