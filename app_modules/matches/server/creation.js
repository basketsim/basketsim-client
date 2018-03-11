function creation() {
    var api = {setMatch, createMatch};

    var chance = new Chance();

    /**
     * Creating new match object based on several parameters and inserts it into the db
     * @param {id object} homeId       id of home team
     * @param {id object} awayId       id of away team
     * @param {string|null} location   (Optional) Can be a string - 'home'|'away'|'random' or null for the 'home' default
     * @param {string} calendarDate    String of YYYY-MM-DD format
     * @param {float} timestamp        (Optional) Exact date of match if needed. Can be null
     * @param {object} competition     Competition details - used to connect the match to a specific competition
     */
    function setMatch(homeId, awayId, location, calendarDate, timestamp, competition, optional) {
        var match = createMatch(homeId, awayId, location, calendarDate, timestamp, competition, optional);

        Matches.insert(match);
        return match;
    }

    function createMatch(homeId, awayId, location, calendarDate, timestamp, competition, optional) {
        var match = {};
        match = setTeamObjects(homeId, awayId);
        match = setLocation(match, location);
        match = setTime(match, calendarDate, timestamp);
        match = setInitialState(match);
        match.competition = competition;

        if (optional) {
            match.optional = optional;
        }

        return match;
    }

    function setTeamObjects(homeId, awayId) {
        var match = {};
        match.homeTeam = setTeamObj(homeId);
        match.awayTeam = setTeamObj(awayId);
        return match;
    }
    function setTeamObj(teamId) {
        var team = {
            id: teamId,
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
        };
        return team;
    }

    function setLocation(match, location) {
        var location = matchLocation(match.homeTeam.id, match.awayTeam.id, location);
        match.arena_id= location.arena_id;
        match.country= location.country;

        return match;
    }
    /**
     * Returns arena id and country for the match
     */
    function matchLocation(homeTeamId, awayTeamId, location) {
        var country;
        var team;
        var arena;
        if (!location || location === 'home') {
            team = Teams.findOne({_id: homeTeamId});
            arena = Arenas.findOne({team_id: homeTeamId});
            country = team.country;
        }

        return {
            arena_id: arena._id,
            country: country
        };
    }

    function setTime(match, calendarDate, timestamp) {
        var time;
        if (timestamp) {
            match.dateTime = matchDateTimeFromTimestamp(timestamp);
        }
        else {
            time = playTimeCountry(match.country, calendarDate);
            match.dateTime = matchDateTime(calendarDate, time); //object with 3 fields, date, time, timestamp
        }

        return match;
    }

    function playTimeCountry(countryName) {
        var dateObj = Dates.findOne({country: countryName});
        var dates = [dateObj.date1, dateObj.date2];
        var randomDate = chance.pick(dates);
        return randomDate;
    }

    function matchDateTimeFromTimestamp(timestamp) {
        return {
            date: moment(timestamp).format('YYYY-MM-DD'),
            time: moment(timestamp).format('HH:mm'),
            timestamp: timestamp
        };
    }

    function matchDateTime(date, time) {
        var format = 'YYYY-MM-DD HH:mm';
        var timestamp = date + ' ' + time;
        timestamp = moment.tz(timestamp, "Europe/Stockholm").valueOf();

        return {
            date: date,
            time: time,
            timestamp: timestamp
        };
    }

    function setInitialState(match) {
        match.state = {
            simulated: false,
            started: false,
            finished: false
        };

        return match;
    }

    return api;
}

export default creation();
