Meteor.methods({
    firePlayer: firePlayer
});

function firePlayer (player_id) {
    var player = Players.findOne({_id: player_id});
    var team = Teams.getByUserid(this.userId);

    if (!ownsPlayer(team, player)) throw new Meteor.Error("not-your-player", "Looks like this player is not in your squad");
    if (player.transfer_id) throw new Meteor.Error("player-on-sale", "You cannot fire player while on sale");

    Players.update({_id: player._id}, {$set:{
        team_id:null,
        releasedAt: new Date().valueOf()
    }});
}

function ownsPlayer(team, player) {
    if (player.team_id._str === team._id._str) {
        return true;
    } else {
        return false;
    }
}