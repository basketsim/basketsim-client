import matchesModule from './../../../matches/server/api.js'
/**
 * Schedule matches for all leagues, for latest season, starting from date
 * @param  {[type]} startDate ex: moment("13-12-2015", "DD-MM-YYYY"); // string with format
 */
function matchScheduling() {
    var chance = new Chance();

    var api = {schedule, check, scheduleCustom};

    function schedule(testCountries) {
        console.log('match scheduling started');
        var countries = butils.general.countries();
        if (testCountries) countries = testCountries;
        var seasonNum = GameInfo.findOne().season + 1;
        var dateString = moment().day(7).format('YYYY-MM-DD'); //next sunday
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
            let leagues = Leagues.find({country:country}).fetch();
            var teams = [];
            _.each(leagues, function(league, index){
                if (league.seasons && league.seasons[seasonNum] && !league.seasons[seasonNum].state.roundsd) {
                    teams = league.seasons[seasonNum].teams;
                    leagueSchedule(teams, league, dateString, playingDates, seasonNum);
                    Leagues.update({_id:league._id}, {$set:{
                       ['seasons.'+seasonNum+'.state.roundsd']: true
                    }});
                    console.log('leagues scheduled', country, index+1, '/', leagues.length);
                }
            });
        });

        console.log('match scheduling ended');
    }
//2016-07-20
    function scheduleCustom(leagues, firstMatchDate, seasonNum) {
        console.log('match scheduleCustom started');
        var dateString = firstMatchDate;
        if (!dateString) {
            console.log('specify a date!');
            return;
        }
        var playingDates = {
            // ['Sunday', 'Wednesday']
            days: [0,3],
            times: 'HOST'
        };
        _.each(leagues, function(league, index){
            let teams = [];
            if (league.seasons && league.seasons[seasonNum] && !league.seasons[seasonNum].state.roundsd) {
                teams = league.seasons[seasonNum].teams;
                console.log('schedule matches teams', teams.length);
                leagueSchedule(teams, league, dateString, playingDates, seasonNum);
                Leagues.update({_id:league._id}, {$set:{
                   ['seasons.'+seasonNum+'.state.roundsd']: true
                }});
            }
        });

        console.log('match scheduleCustom ended');
    }

    function check() {
        var leagues = Leagues.find();
        var seasonNum = GameInfo.findOne().season + 1;
        leagues.forEach(function (league) {
            let matchesCount = Matches.find({"competition._id": league._id, "competition.season":seasonNum, "competition.round":1}).count();
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
    function leagueSchedule(teamsArray, league, dateString, playingDates, seasonNum) {
        var length = teamsArray.length;
        var teams = chance.shuffle(teamsArray);
        var lastTeam;
        var matches = [];
        var returnMatches = [];
        var rounds = length - 1;
        var round;
        var allMatches = [];
        var dates = roundDates(playingDates, dateString, rounds*2);

        for (round=1; round <= rounds; round++) {
            for (var i=0; i< length/2; i++) {
                if (round % 2 !== 0) {
                    matches.push(setLeagueMatch(seasonNum, teams[i]._id, teams[length-(i+1)]._id, league, round, dates[round-1])); //first half of array plays home
                } else {
                    matches.push(setLeagueMatch(seasonNum, teams[length-(i+1)]._id, teams[i]._id, league, round, dates[round-1])); //second half plays away
                }
            }

            //alter teams array
            lastTeam = teams.pop();
            teams.splice(1, 0, lastTeam);
        }

        // create second leg matches
        round = round - 1;
        for (var k=0; k<matches.length; k++) {
            returnMatches.push(setLeagueMatch(seasonNum, matches[k].awayTeam.id, matches[k].homeTeam.id, league, matches[k].competition.round + round, dates[matches[k].competition.round + round-1]));
        }

        allMatches = matches.concat(returnMatches);

        if (allMatches.length !== 0) Matches.batchInsert(allMatches);

        return allMatches;
    }

    /**
     * Set one league match
     */
    function setLeagueMatch(seasonNum, homeId, awayId, league, round, calendarDate) {
        var competition = {
            collection: 'Leagues',
            _id: league._id,
            season: seasonNum,
            level: league.level,
            round: round,
            type: 'league',
            stage: 'league'
        };
        return matchesModule.createMatch(homeId, awayId, 'home', calendarDate, null, competition);
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
            date = moment(dateString, 'YYYY-MM-DD').add(playingDates[dayCounter], 'days').add(weekOffset, 'weeks');
            date = readableDate(date);
            if (date === '2016-11-27') date = '2016-11-29';
            dates.push(date);
            dayCounter++;

            if(dayCounter === playingDates.length) {
                dayCounter = 0;
                weekOffset++;
            }
        }
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

    return api;
}

export default matchScheduling();