import matchesModule from './../../../../matches/server/api.js'

var chance = new Chance();

Meteor.methods({
    'competitions:leagues:league-matches-method:scheduleLeagueMatches': scheduleLeagueMatches,
    'competitions:leagues:league-matches-method:checkMatches': checkMatches
});

/**
 * Schedule matches for all leagues, for latest season, starting from date
 * @param  {[type]} startDate ex: moment("13-12-2015", "DD-MM-YYYY"); // string with format
 */
function scheduleLeagueMatches(dateString) {
    if (this.userId !== 'wg2H3Bem7BrERkEsZ') return;
    var countries = ["Romania"];

    if (!dateString) {
        console.log('specify a date!');
        return;
    }
    var playingDates = {
        // ['Sunday', 'Wednesday']
        days: [0,3],
        times: 'HOST'
    };
    _.each(countries, function(country){
        // let leagues = Leagues.find({country:country}).fetch();
        var leagues = Leagues.find({_id: new Mongo.ObjectID("55cf04f11cc5f84ae61f0996")}).fetch(); //test with own league
        var currentSeason = 1;
        var teams = [];
        _.each(leagues, function(league, index){
            if (league.seasons && league.seasons[24] && !league.seasons[24].state.roundsd) {
                currentSeason = league.currentSeason;
                teams = league.seasons[currentSeason].teams;
                leagueSchedule(teams, league, dateString, playingDates);
                Leagues.update({_id:league._id}, {$set:{
                   ['seasons.24.state.roundsd']: true
                }});
                console.log('leagues done', country, index+1, '/', leagues.length);
            }
        });
    });

}

function checkMatches() {
    var leagues = Leagues.find();
    leagues.forEach(function (league) {
        let matchesCount = Matches.find({"competition._id": league._id, "competition.season":24, "competition.round":1}).count();
        if (matchesCount !== 7) {
            console.log('league has', matchesCount, 'matches');
            console.log('league info:', league.country, league.name);
        }
    });
}

/**
 * Go through all teams and set a home/away round robin
 * @param  {[type]} teamsArray   Array of teams that contain an _id property
 * @param  {[type]} leagueId     The id of the league collection
 * @param  {[type]} momentDate    Readable start date day-month-year
 * @param  {[type]} playingDates Array of numerical represented playing dates
 * @return {[type]}              Return array of matches
 */
function leagueSchedule(teamsArray, league, dateString, playingDates) {
    var length = teamsArray.length;
    var teams = chance.shuffle(teamsArray);
    var lastTeam;
    var matches = [];
    var returnMatches = [];
    var rounds = length - 1;
    var round;
    var allMatches = [];
    var dates = roundDates(playingDates, dateString, rounds*2);
    // console.log('dates are', dates);

    for (round=1; round <= rounds; round++) {
        for (var i=0; i< length/2; i++) {
            if (round % 2 !== 0) {
                matches.push(setLeagueMatch(teams[i]._id, teams[length-(i+1)]._id, league, round, dates[round-1])); //first half of array plays home
            } else {
                matches.push(setLeagueMatch(teams[length-(i+1)]._id, teams[i]._id, league, round, dates[round-1])); //second half plays away
            }
        }

        //alter teams array
        lastTeam = teams.pop();
        teams.splice(1, 0, lastTeam);
    }

    // create second leg matches
    round = round - 1;
    for (var k=0; k<matches.length; k++) {
        returnMatches.push(setLeagueMatch(matches[k].awayTeam.id, matches[k].homeTeam.id, league, matches[k].competition.round + round, dates[matches[k].competition.round + round-1]));
    }

    console.log('matches', matches.length);
    console.log('returnMatches', returnMatches.length);

    allMatches = matches.concat(returnMatches);

    // if (allMatches.length !== 0) Matches.batchInsert(allMatches);

    return allMatches;
}

/**
 * Set one league match
 */
function setLeagueMatch(homeId, awayId, league, round, calendarDate) {
    var competition = {
        collection: 'Leagues',
        _id: league._id,
        season: league.currentSeason,
        level: league.level,
        round: round,
        type: 'league',
        stage: 'league'
    };
    return matchesModule.setMatch(homeId, awayId, 'home', calendarDate, null, competition);
};

/**
 * Go through all rounds for this competition and return an array of dates, matching the rounds
 */
function roundDates(compDates, dateString, noOfRounds) {
    var date = '';
    var dates = [];
    var playingDates = compDates.days;
    var weekOffset = 0;
    var dayCounter = 0;

    for (var i=0; i< noOfRounds; i++) {
        date = moment(dateString, 'DD-MM-YYYY').add(playingDates[dayCounter], 'days').add(weekOffset, 'weeks');
        date = readableDate(date);
        dates.push(date);
        dayCounter++;

        if(dayCounter === playingDates.length) {
            dayCounter = 0;
            weekOffset++;
        }
    }
    console.log('dates this is stupid', dates);
    return dates;
}

function readableDate(momentDate) {
    var date = momentDate.year() + '-' + formatMonth(momentDate.month()) + '-' + doubleDigit(momentDate.date());
    return date;
}

/**
 * Takes an iteger month as argument. First, increase by 1 to make it in the 1-12 range, instead of 0-11
 * @return {string} Nicely formatted month
 */
function formatMonth(month) {
    var newMonth = month + 1;
    newMonth = doubleDigit(newMonth);
    return newMonth;
}

/**
 * Takes an iteger as argument. If it is between 1-9, adds 0 in front and returns a string
 * @return {[type]} [description]
 */
function doubleDigit(value) {
    var num = parseInt(value);
    if (num < 10) {
        num = '0' + num;
    }
    return num;
}