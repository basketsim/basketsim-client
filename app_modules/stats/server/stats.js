import mongojs from 'mongojs';

function stats() {
    var api = {setEmptyStats, updatePlayers, addPlayersToCompetition, updateTeam, setAll, reset, _set, _emptyStats, _playerIDListFromMatchTeam, _activeTeamIDs, _getCompetitionInfo, _emptyStatsObj,
                _updatePlayers, _updatePlayer, _updateTeam, _hasPlayed, _addPlayersToCompetition, _converter, _prependToObjectKeys};

    /** Passing _emptyStats to be executed. Exposing it for method use.*/
    function setEmptyStats() {
        // api._set(api._emptyStats, Players, Teams);
        api._set(api._emptyStats, Players);
    }

    function updatePlayers() {
        api._set(api._updatePlayers, Players);
    }

    function addPlayersToCompetition() {
        api._set(api._addPlayersToCompetition, Leagues, NationalCups);
    }

    function updateTeam() {
        api._set(api._updateTeam, Teams);
    }

    /** Synchronously go through each setter and execute it */
    function setAll() {
        api.setEmptyStats();
        api.addPlayersToCompetition();
        api.updatePlayers();
        api.updateTeam();
    }

    /**
     * Used mostly for testing. Removes the stats objects from players, teams and leagues
     */
    function reset() {
        console.log('reset stats started');
        Players.update({ country:'Italy' }, {$unset: { stats:'' }}, { multi: true });
        Teams.update({ country:'Italy' }, {$unset: { stats:'' }}, { multi: true });
        // Leagues.update({ country:'Italy' }, {$unset: { stats:'' }}, { multi: true });
        Matches.update({ country:'Italy' }, {$unset: { 'dirty.stats':'' }}, {multi:true});
        console.log('reset stats finished');
    }

    /**
     * Select all matches in which an active team is home and all in which an active team is away
     * For each, iterate through all and execute the setterCallback, passing thea team, competition and bulk updater
     * The bulk is executed after all operations are added
     * @param {function} setterCallback    Function to execute for each home match and away match
     * @param {[type]} mongojsCollection  Initialize the bulk update based on this collection
     */
    function _set(setterCallback) {
        console.log('set stats', setterCallback.name, 'started after redeploy');
        var teamIDs = api._activeTeamIDs();
        var findLimit = 200000;

        var homeQuery = {country:'Italy', 'homeTeam.id': {$in: teamIDs}, "state.finished":true, 'competition.collection': {$ne: 'PheonixTrophy'}, ['dirty.stats.homeTeam.'+setterCallback.name]: {$ne: true}};
        var homeFields = {homeTeam:true, competition:true};
        var awayQuery = {country:'Italy', 'awayTeam.id': {$in: teamIDs}, "state.finished":true, 'competition.collection': {$ne: 'PheonixTrophy'}, ['dirty.stats.awayTeam.'+setterCallback.name]: {$ne: true}};
        var awayFields = {awayTeam:true, competition:true};

        var hlength = Matches.find(homeQuery, {fields: homeFields}).count();
        var alength = Matches.find(awayQuery, {fields: awayFields}).count();

        console.log('lengths of matches hlength, alength', hlength, alength);
        if (hlength === 0 && alength === 0) console.log(`all ${setterCallback.name} stats compiled`);

        _setEach('homeTeam', homeQuery, homeFields, hlength, findLimit, 0);
        _setEach('awayTeam', awayQuery, awayFields, alength, findLimit, 0);

        function _setEach(teamStr, query, fields, length) {
            // for (var skip=0; skip<length; skip+= findLimit) {
                console.log(setterCallback.name, teamStr, 'length', length);
                var matches = Matches.find(query, {fields: fields});

                matches.forEach(function (match, j) {
                    setterCallback(match[teamStr], match.competition);
                    Matches.update({_id: match._id}, {$set: {['dirty.stats.'+teamStr+'.'+setterCallback.name]: true}});

                    if ((j)%2000 === 0) console.log(teamStr + ' matches updated', j, '/', length);
                });

            // }
        }
    }

    /**
     * For each matchTeam passed, get the players from db, check if the stats for the competition have been initialized
     * If not, push the update to the bulk updater
     * @param  {object} matchTeam   Team object contained in the match object
     * @param  {[type]} competition [description]
     * @param  {[type]} bulk        [description]
     * @return {[type]}             [description]
     */
    function _emptyStats(matchTeam, competition) {
        var playerIDs = api._playerIDListFromMatchTeam(matchTeam);

        var players = Players.find({_id: {$in: playerIDs}});
        var team = Teams.findOne({_id: matchTeam.id}, {fields: {stats: true}});

        var ci = api._getCompetitionInfo(competition);

        var key = 'stats.' + competition.season + '.' + competition._id._str;

        players.forEach(function (player) {
            Players.update({_id: mongojs.ObjectId(player._id._str)}, {$set: {
                [key]: {
                    _id: competition._id,
                    collection: competition.collection,
                    country: ci.country,
                    name: ci.name,
                    stats: api._emptyStatsObj()
                }
            }});
        });

        if (!team) return;
        if (!team.stats || !team.stats[competition.season] || !team.stats[competition.season][competition._id._str]) {
            Teams.update({_id: team._id}, {$set: {
                [key]: {
                    _id: competition._id,
                    collection: competition.collection,
                    country: ci.country,
                    name: ci.name,
                    stats: api._emptyStatsObj()
                }
            }});
        }
    }

    /**
     * This function will probably need more bulk features
     */
    function _addPlayersToCompetition(matchTeam, competition) {
        if (competition.collection === 'Playoffs') return;

        var playerIDs = api._playerIDListFromMatchTeam(matchTeam);
        var playerStr = [];
        _.each(playerIDs, function(id){
            playerStr.push(id._str);
        });

        global[competition.collection].update({_id: competition._id}, {$addToSet:{
            ['stats.'+competition.season+'.players']: {$each: playerStr}
        }});
    }

    function _updatePlayers(matchTeam, competition) {
        var positions = ['PG', 'SG', 'SF', 'PF', 'C'];
        var fives = [matchTeam.startingFive, matchTeam.subs];
        const season = GameInfo.findOne().season;

        _.each(positions, function(pos) {
            _.each(fives, function(five) {
                if(five[pos] && five[pos].matchRatings && five[pos].player_id) {
                    api._updatePlayer(five[pos].player_id, five[pos].matchRatings, competition);
                }
            });
        });
    }

    function _updatePlayer(playerID, mr, competition) {
        var key = 'stats.' + competition.season + '.' + competition._id._str+ '.stats.';
        var inc = {};
        var matchInc = 0;
        api._converter(inc, mr);
        if (api._hasPlayed(inc)) matchInc = 1;
        api._prependToObjectKeys(key, inc);

        inc[key+'matches'] = matchInc; //add one matches played

        Players.update({_id: playerID}, {$inc: inc});
    }

    function _updateTeam(matchTeam, competition) {
        var mr = matchTeam.matchRatings;
        var key = 'stats.' + competition.season + '.' + competition._id._str+ '.stats.';
        var inc = {};
        api._converter(inc, mr);
        api._prependToObjectKeys(key, inc);

        inc[key+'matches'] = 1;
        Teams.update({_id: matchTeam.id}, {$inc: inc});
    }

    function _hasPlayed(stats) {
        var hasPlayed = false;
        _.each(stats, function(val, key){
            if (val !== 0) hasPlayed = true;
        });

        return hasPlayed;
    }

    /**
     * Converts a nested object to a flat one by appending the name of the nested property to the parent
     * @param  {[type]} res  Object that gets the modifications - pass an empty one
     * @param  {[type]} obj  Object that will be flatified. It will not be modified!
     * @param  {[type]} name Leave empty. It's used in the recursion for passing the name of the property
     */
    function _converter(res, obj, name) {
        _.each(obj, function(value, label){
            if (typeof value === 'object') {
                _converter(res, value, label);
            } else {
                if (name) {
                    res[name+'.'+label] = value;
                } else {
                    res[label]= value;
                }
            }
        });
    }

    /**
     * Pass a string to be added to all keys in an object
     * @param  {string} key The string to be prepended to the key
     * @param  {object} obj Object to be modified
     */
    function _prependToObjectKeys(key, obj) {
        for (var prop in obj) {
            obj[key+prop] = obj[prop];
            delete obj[prop];
        }
    }

    function _emptyStatsObj() {
        return {
            "turnovers": 0,
            "blocks": 0,
            "steals": 0,
            "twoPoints": {
                "converted": 0,
                "missed": 0
            },
            "threePoints": {
                "converted": 0,
                "missed": 0
            },
            "freeThrows": {
                "converted": 0,
                "missed": 0
            },
            "rebounds": {
                "defensive": 0,
                "offensive": 0
            },
            "fastbreaks": 0,
            "assists": 0,
            "fouls": 0,
            "score": 0,
            "matches": 0
        }
    }

    /**
     * Based on the competition object from the match,
     * Return the name and country of that specific competition
     * @param  {object} competition Competition object from the match
     * @return {object}             Object containing competition name and country
     */
    function _getCompetitionInfo(competition) {
        var name = competition.collection;
        if (!global[name]) {
            console.log('competition', name, 'not defined');
            return {name:null, country:null}
        } else {
            return global[name].findOne({_id: competition._id}, {fields: {name:true, country:true}});
        }
    }

    /**
     * Pass a team object from a match
     * Returns the ids of the players that took part in the match, for one team
     */
    function _playerIDListFromMatchTeam(matchTeam) {
        var positions = ['PG', 'SG', 'SF', 'PF', 'C'];
        var fives = [matchTeam.startingFive, matchTeam.subs];

        var playerIDs = [];

        _.each(positions, function(pos) {
            _.each(fives, function(five) {
                if(five[pos] && five[pos].matchRatings && five[pos].player_id) {
                    playerIDs.push(five[pos].player_id);
                }
            });
        });

        return playerIDs;
    }

    function _activeTeamIDs() {
        var teams = Teams.getActiveIDs();
        var teamIDs = [];
        _.each(teams, function(team){
            teamIDs.push(team._id);
        });

        return teamIDs;
    }

    return api;
}

export default stats();