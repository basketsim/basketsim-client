import news from './../../news/server/api.js';

function grow() {
    var api = {allTeams, all, one, multiAllTeams, multiple, _eligibleGrowthPlayers, multiOne, _weight, _updatePlayer};

    function allTeams() {
        var teams = Teams.getActiveIDs();
        _.each(teams, function(team, i){
            api.all(team._id);
        });
    }

    /**
     * Get eligible grow players per team
     * Get growth of each player
     * Create report with players and growth
     */
    function all(teamID) {
        var players = api._eligibleGrowthPlayers(teamID);
        var progressReport = [];
        _.each(players, function(player){
            let growth = api.one(player);
            let weight = api._weight(player, growth);

            api._updatePlayer(player, growth, weight);

            if (growth > 0) {
                progressReport.push({
                    player: {
                        _id: player._id,
                        name: player.name,
                        surname: player.surname
                    },
                    growth: growth,
                    weight: weight
                });
            };


        });

        news.game.growthReport(teamID, progressReport);
        return progressReport;
    }

    function one(player) {
        var rand = Math.random();
        var growth = 0;

        if (rand > 0.94) {
            growth = 2;
        } else if (rand > 0.74) {
            growth = 1;
        }

        return growth;
    }

    function _weight(player, growth) {
        var gain = 0;
        for (let i = 0; i < growth; i++) {
            gain = gain + parseInt(Math.random() * 10)/10;
        }
        return parseInt(gain * 10)/10;
    }

    function _updatePlayer(player, growth, gain) {
        if (growth > 0) {
            let newHeight = parseInt(player.height) + growth;
            let newWeight = parseFloat(player.weight) + gain;

            Players.update({_id: player._id}, {
                $set: { height: newHeight, weight: newWeight },
                $push: {
                    'history.height': {value: newHeight, timestamp: new Date().valueOf()},
                    'history.weight': {value: newWeight, timestamp: new Date().valueOf()}
                }
            });
        }
    }

/**
 * Run once section
 */

    /**
     * Select active teams
     * Call growth that will be done multiple times
     */
    function multiAllTeams() {
        var teams = Teams.getActiveIDs();
        _.each(teams, function(team, i){
            console.log('grown teams', i, '/', teams.length);
            api.multiple(team._id);
        });
    }

    /**
     * Call growth on each player
     * Generate report based on the sum of growth
     */
    function multiple(teamID) {
        var players = api._eligibleGrowthPlayers(teamID);
        var progressReport = [];
        _.each(players, function(player){
            let growth = api.multiOne(player);
            let weight = api._weight(player, growth);

            api._updatePlayer(player, growth, weight);

            if (growth > 0) {
                progressReport.push({
                    player: {
                        _id: player._id,
                        name: player.name,
                        surname: player.surname
                    },
                    growth: growth,
                    weight: weight
                });
            };
        });

        news.game.growthReport(teamID, progressReport);
        return progressReport;
    }

    /**
     * Grow player for 7 weeks
     * Return total height
     */
    function multiOne() {
        var hinc = 0;
        var rand = 0;
        for (var i=0; i<7; i++) {
            rand = Math.random();
            if (rand > 0.94) {
                hinc = hinc + 2;
            } else if (rand > 0.65) {
                hinc = hinc + 1;
            }
        }

        return hinc;
    }
/**
 * End of run once section
 */

    function _eligibleGrowthPlayers(teamID) {
        return Players.find({age: {$lte: 18}, team_id: teamID}, {fields: {_id: true, name: true, surname: true, height:true, weight: true}}).fetch();
    }

    return api;
}

export default grow();