import stats from './../stats.js'
Meteor.methods({
    'stats:setEmptyStats': function () {
        if (this.userId !== 'wg2H3Bem7BrERkEsZ') return;
        stats.setEmptyStats();
    },
    'stats:updatePlayers': function () {
        if (this.userId !== 'wg2H3Bem7BrERkEsZ') return;
        stats.updatePlayers();
    },
    'stats:addPlayersToCompetition': function () {
        if (this.userId !== 'wg2H3Bem7BrERkEsZ') return;
        stats.addPlayersToCompetition();
    },
    'stats:updateTeam': function () {
        if (this.userId !== 'wg2H3Bem7BrERkEsZ') return;
        stats.updateTeam();
    },
    'stats:setAll': function () {
        if (this.userId !== 'wg2H3Bem7BrERkEsZ') return;
        stats.setAll();
    },
    'stats:reset': function () {
        if (this.userId !== 'wg2H3Bem7BrERkEsZ') return;
        stats.reset();
    },
    'stats:getLeaguePlayers': getLeaguePlayers
});

function getLeaguePlayers(playerArray, cs, lid) {
    cs = parseInt(cs, 10);
    var playerIDs = [];
    _.each(playerArray, function(str){
        playerIDs.push(new Mongo.ObjectID(str));
    });
    var players = Players.find({_id: {$in: playerIDs}}, {
        fields: {
            ['stats.'+cs+'.'+lid+'.stats']:true,
            name: true,
            surname: true,
            team_id: true
        }
    }).fetch();

    var teamids = [];
    var teams = [];
    _.each(players, function(player){
        teamids.push(player.team_id);
    });
    teams = Teams.find({_id: {$in: teamids}}, {fields: {name: true}}).fetch();
    _.each(players, function(player){
        _.each(teams, function(team){
            if (player.team_id && player.team_id._str === team._id._str) {
                player.team_name = team.name;
            }
        });
    });

    return players;
}