var chance = new Chance();

global.CompUtils = {
    generateGroupMatches: generateGroupMatches,
    generateSingleMatch: generateSingleMatch,
    roundDates: roundDates,
    matchDateTime: matchDateTime,
    setMatch: setMatch
};

/**
 * Takes an array of teams and generates home and away matches for those teams
 * @param  {array} teamsArray [description]
 * @param  {object} competitionInfo  Info about the competition this match belongs to.
 * @return {[type]}            [description]
 */
function generateGroupMatches(teamsArray, competitionInfo, competitionRules) {
    var length = teamsArray.length;
    var teams = chance.shuffle(teamsArray);
    var lastTeam;
    var matches = [];
    var returnMatches = [];
    var rounds = length - 1;
    var round;
    var allMatches = [];
    var dates = roundDates(competitionRules.playingDates, competitionInfo.stage, competitionInfo.startDate, rounds*2);

    for (round=1; round <= rounds; round++) {
        for (var i=0; i< length/2; i++) {
            if (round % 2 !== 0) {
                matches.push(setMatch(teams[i]._id, teams[length-(i+1)]._id, round, competitionInfo, competitionRules, dates[round-1])); //first half of array plays home
            } else {
                matches.push(setMatch(teams[length-(i+1)]._id, teams[i]._id, round, competitionInfo, competitionRules, dates[round-1])); //second half plays away
            }
        }

        //alter teams array
        lastTeam = teams.pop();
        teams.splice(1, 0, lastTeam);
    }

    // create second leg matches
    round = round - 1;
    for (var k=0; k<matches.length; k++) {
        returnMatches.push(setMatch(matches[k].awayTeam.id, matches[k].homeTeam.id, matches[k].competition.round + round, competitionInfo, competitionRules, dates[matches[k].competition.round + round-1]));
    }

    allMatches = matches.concat(returnMatches);
    return allMatches;
}

function generateSingleMatch(homeTeamId, awayTeamId, competitionInfo, competitionRules) {
    setMatch(homeTeamId, awayTeamId, 1, competitionInfo, competitionRules);
}

/**
 * [setMatch description]
 * @param {[type]} home            [description]
 * @param {[type]} away            [description]
 * @param {[type]} round           [description]
 * @param {object} competitionInfo               Details about the competition, so the match can be used with a purpose.
 *     @param {string} competitionInfo.collection    Which collection should be checked
 *     @param {id} competitionInfo.id                Id of entry in the table
 *     @param {string} competitionInfo.type          Ex: NatLeague, NatCup, Basketsim Summer Trophy, Friendly, etc
 *     @param {integer} competitionInfo.season       Season Number. Ex: 1, 2, 22,
 *     @param {string} competitionInfo.arenaLocation Ex: 'Home'/'Neutral'
 *     @param {string} competitionInfo.stage         Ex: 'Group'/'Playoff'/'League'
 *     @param {string} competitionInfo.round         Ex: Round of stage
 */
function setMatch(home, away, round, competitionInfo, competitionRules, date, timestamp) {
    var location = matchLocation(home, competitionInfo);
    var time = playTimeCountry(location.country);
    var match = {
        homeTeam: {
            id: home,
            startingFive: {
                PG: {player_id: null},
                SG: {player_id: null},
                SF: {player_id: null},
                PF: {player_id: null},
                C: {player_id: null}
            },
            subs: {
                PG: {player_id: null},
                SG: {player_id: null},
                SF: {player_id: null},
                PF: {player_id: null},
                C: {player_id: null}
            },
            defensive: 'normal',
            offensive: 'normal',
            tacticsSet: false
        },
        awayTeam: {
            id: away,
            startingFive: {
                PG: {player_id: null},
                SG: {player_id: null},
                SF: {player_id: null},
                PF: {player_id: null},
                C: {player_id: null}
            },
            subs: {
                PG: {player_id: null},
                SG: {player_id: null},
                SF: {player_id: null},
                PF: {player_id: null},
                C: {player_id: null}
            },
            defensive: 'normal',
            offensive: 'normal',
            tacticsSet: false
        },
        arena_id: location.arena_id,
        country: location.country,
        state: {
            simulated: false,
            started: false,
            finished: false
        }
    };

    if (timestamp) {
        match.dateTime = matchDateTimeFromTimestamp(timestamp);
    }
    else {
        match.dateTime = matchDateTime(date, time); //object with 3 fields, date, time, timestamp
    }
    match.competition = _.extend({}, competitionInfo);
    match.competition.round = round;

    //insert match into collection
    Matches.insert(match);

    return match;
}

function matchDateTimeFromTimestamp(timestamp) {
    return {
        date: moment(timestamp).format('YYYY-MM-DD'),
        time: moment(timestamp).format('HH:mm'),
        timestamp: timestamp
    };
}

function matchDateTime(date, time) {
    console.log('matchDateTime', time);
    var format = 'YYYY-MM-DD HH:mm';
    var timestamp = date + ' ' + time;
    timestamp = moment(timestamp, format).valueOf();
    return {
        date: date,
        time: time,
        timestamp: timestamp
    };
}
/**
 * Returns arena id and country for the match
 */
function matchLocation(homeTeamId, competitionInfo) {
    var country;
    var team;
    var arena;
    if (competitionInfo.arenaLocation === undefined || competitionInfo.arenaLocation === 'Home') {
        team = Teams.findOne({_id: homeTeamId});
        arena = Arenas.findOne({team_id: homeTeamId});
        country = team.country;
    } else {
        console.log('pick neutral arena');
    }

    return {
        arena_id: arena._id,
        country: country
    };
}

/**
 * Go through all rounds for this competition and return an array of dates, matching the rounds
 * @param  {[type]} competitionRules [description]
 * @param  {[type]} startDate        [description]
 * @param  {[type]} stage        [    groupStage/playoffStage
 * @param  {[type]} rounds           [description]
 * @return {[type]}                  [description]
 */
function roundDates(compDates, stage, startDate, noOfRounds) {
    var date = '';
    var dates = [];
    var playingDates = compDates[stage].days;
    var weekOffset = 0;
    var dayCounter = 0;

    for (var i=0; i< noOfRounds; i++) {
        date = moment(startDate).add(playingDates[dayCounter], 'days').add(weekOffset, 'weeks');
        date = DateUtils.readableDate(date);
        dates.push(date);
        dayCounter++;

        if(dayCounter === playingDates.length) {
            dayCounter = 0;
            weekOffset++;
        }
    }
    return dates;
}

function playTimeCountry(countryName) {
    console.log('playTimeCountry', countryName);
    var dateObj = Dates.findOne({country: countryName});
    var dates = [dateObj.date1, dateObj.date2];
    console.log('playTimeCountry dates ', dates);
    var randomDate = chance.pick(dates);
    console.log('random date', randomDate);
    return randomDate;
}