import utils from './../../../utils/server/api.js';
Meteor.publish('playerDetails', function (player_id) {
    var player = Players.findOne({_id: new Mongo.ObjectID(player_id)}, {fields: {transfer_id: true}});
    var ownsPlayer = utils.validations.userOwnsPlayer(this.userId, player._id);

    if (ownsPlayer || player.transfer_id) {
        return Players.find({_id: player._id});
    } else {
        return Players.find({_id: player._id}, {fields: Fields.players.restricted});
    }

});