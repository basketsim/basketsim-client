function experience () {
    var api = {add, _matchPlayers, _matchExperience, _expPerPlayers, _expGain, _update, _addInvolvementExp};

    /**
     * Get players from matches
     * Get experience per match
     * Gets added experience per player
     * Updates players
     */
    function add(match) {
        var players = api._matchPlayers(match);
        var matchExp = api._matchExperience(match);
        var expPerPlayers = api._expPerPlayers(matchExp, players);

        api._update(expPerPlayers);
    }

    /**
     * Go over the current match and get all starting five players
     * Fetch player objects with experience
     */
    function _matchPlayers(match) {
        var positions = ['PG', 'SG', 'SF', 'PF', 'C'];
        var startingFives = [match.homeTeam.startingFive, match.awayTeam.startingFive];
        var playerIDs = [];
        var players = [];

        _.each(startingFives, function(team){
            _.each(positions, function(pos){
                playerIDs.push(team[pos].player_id);
            });
        });

        players = Players.find({_id: {$in: playerIDs}}, {fields:{experience:1}}).fetch();

        return players;
    }

    /**
     * Keep info about the experience each competition gives, based on collection type
     * Returns that value
     */
    function _matchExperience(match) {
        var exp = {
            'Leagues': 2.8,
            'International': 4.25,
            'NationalCups': 2.8
        };

        return exp[match.competition.collection];
    }

    /**
     * Takes the match experience and the players.
     * Computes the experience gain based on the match exp and the player current experience
     * Returns array of objects composed of player ids and finalExperience gain per player
     */
    function _expPerPlayers(matchExp, players) {
        var epp = [];
        _.each(players, function(player){
            epp.push({_id: player._id, experience: player.experience, expGain: api._expGain(matchExp, player)});
        });

        return epp;
    }

    /**
     * Gets player exp on 0-20 scale and sets 1 as minimum
     * Exp gain is match experience divided by total experience
     * @return {float}  Exp gain with 2 decimals
     */
    function _expGain(matchExp, player) {
        var expGain = 0;
        var exp = parseFloat(player.experience) / 8;

        if (exp < 1) exp = 1;

        matchExp = api._addInvolvementExp(matchExp, exp); //match exp is the exp gained in the current match. Exp is the player experience
        expGain = matchExp/exp;

        return parseInt(expGain*100)/100;
    }

    function _addInvolvementExp(matchExp, playerExp) {
        var expBonus = {
            2.8: 0.1,
            4.25: 0.25
        };
        matchExp = matchExp + parseInt(playerExp) * expBonus[matchExp]; //2.8 + x * 0.1

        return matchExp;
    }

    /**
     * Takes expPerPlayer and updates each player in the database
     * @param  {array} expPerPlayer Array of objects composed of player ids and finalExperience gain per player
     */
    function _update(expPerPlayer) {
        _.each(expPerPlayer, function (player) {
            let newExp = parseFloat(player.experience) + player.expGain;
            if (!isNaN(newExp)) {
                Players.update({_id: player._id}, {$set: {experience: newExp},
                    $push:{'history.experience': {value: newExp, timestamp: new Date().valueOf()}}
                });
            } else {
                console.log('experience not updated');
            }
        });
    }

    return api;
}

export default experience();