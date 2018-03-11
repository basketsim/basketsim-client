import playersModel from './../../../../players/client/models/players-clientmodel.js';

Template.PlayerSummary.onCreated(function(){
    this.cdata = {
        players: new ReactiveVar([])
    }
    updateData(this);
});

function updateData(tpl) {
    var match = tpl.data.match;
    var playerIDs = [];
    var fives = [match.homeTeam.startingFive, match.homeTeam.subs, match.awayTeam.startingFive, match.awayTeam.subs];

    fives.forEach(function (five) {
        for (let pos in five) {
            playerIDs.push(five[pos].player_id);
        }
    });

    playersModel.getNamesByIDList(playerIDs, function(players){
        tpl.cdata.players.set(players);
    });
}


Template.PlayerSummary.helpers({
    'total': function(stat) {
        return this.ratings[stat].converted + this.ratings[stat].missed;
    },
    'percentage': function(stat) {
        var percentage = 0;
        percentage = (this.ratings[stat].converted/ (this.ratings[stat].converted + this.ratings[stat].missed)) * 100;
        if (isNaN(percentage)) percentage = 0;
        percentage = Math.round(percentage * 10) / 10;
        return percentage;
    },
    getPoints: function() {
        var points = this.ratings.freeThrows.converted + this.ratings.twoPoints.converted * 2 + this.ratings.threePoints.converted* 3;
        return points;
    },
    getEfficency: function() {
        var r = this.ratings;
        var points = r.freeThrows.converted + r.twoPoints.converted * 2 + r.threePoints.converted* 3;
        var rebs = r.rebounds.defensive + r.rebounds.offensive;
        var missedfg = r.twoPoints.missed + r.threePoints.missed;

        var eff = points + rebs + r.assists + r.steals + r.blocks - missedfg - r.freeThrows.missed - r.turnovers;

        return eff;
    },
    'playerRatings': function (whichTeam) {
        var tpl = Template.instance();
        var name = '';
        var surname = '';
        var player = {};
        var pObject = {};
        var players = [];
        var positions = ['PG', 'SG', 'SF', 'PF', 'C'];
        var match = this.match;
        var team = match[whichTeam];
        var allPlayers = tpl.cdata.players.get();

        _.each(positions, function(pos){
            player = _.find(allPlayers, function(p){
                return p._id._str === team.startingFive[pos].player_id._str
            });
            if (player) {
                name = player.name;
                surname = player.surname;
                player.ratings = team.startingFive[pos].matchRatings;
                player.name = name + ' ' + surname;
                player.surname = surname/*.substr(0, 3)+ '...'*/;
                player.position = pos;
                player.lineup = '';

                players.push(player);
            }
        });
        _.each(positions, function(pos){
            if (team.subs[pos].player_id) {
                player = _.find(allPlayers, function(p){
                    return p._id._str === team.subs[pos].player_id._str;
                });
                if (player) {
                    name = player.name;
                    surname = player.surname;
                    player.ratings = team.subs[pos].matchRatings;
                    player.name = name + ' ' + surname;
                    player.surname = surname;
                    player.position = pos;
                    player.lineup = '(sub)';

                    players.push(player);
                }

            } else {
                player = {};
                player.ratings = noRatings();
                player.name = '-';
                player.surname = '-';
                player.position = pos;
                player.lineup = '(sub)';

                players.push(player);
            }
        });

        return players;
    }
});

function noRatings() {
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
      "score": 0
    };

}