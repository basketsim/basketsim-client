import mongojs from 'mongojs';

function perMatch() {
    var api = {update, _emptyStats, _playerIDListFromMatchTeam, _getCompetitionInfo, _emptyStatsObj,
                _updatePlayers, _updatePlayer, _hasPlayed, _updateTeam, _addPlayersToCompetition, _converter, _prependToObjectKeys};

    function update(match) {
        var teams = [match.homeTeam, match.awayTeam];
        var competition = match.competition;
        _.each(teams, function(team){
            api._emptyStats(team, competition);
            api._addPlayersToCompetition(team, competition);
            api._updatePlayers(team, competition);
            api._updateTeam(team, competition);
        });
        Matches.update({_id: match._id}, {$set: {
            'dirty.stats.homeTeam._emptyStats': true,
            'dirty.stats.homeTeam._addPlayersToCompetition': true,
            'dirty.stats.homeTeam._updatePlayers': true,
            'dirty.stats.homeTeam._updateTeam': true,

            'dirty.stats.awayTeam._emptyStats': true,
            'dirty.stats.awayTeam._addPlayersToCompetition': true,
            'dirty.stats.awayTeam._updatePlayers': true,
            'dirty.stats.awayTeam._updateTeam': true
        }});
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
            if (!player.stats || !player.stats[competition.season] || !player.stats[competition.season][competition._id._str]) {
                Players.update({_id: player._id}, {$set: {
                    [key]: {
                        _id: competition._id,
                        collection: competition.collection,
                        country: ci.country,
                        name: ci.name,
                        stats: api._emptyStatsObj()
                    }
                }});
            }
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

    function _hasPlayed(stats) {
        var hasPlayed = false;
        _.each(stats, function(val, key){
            if (val !== 0) hasPlayed = true;
        });

        return hasPlayed;
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

    return api;
}

export default perMatch();