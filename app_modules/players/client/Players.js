import playersModel from './models/players-clientmodel.js';

Template.Players.onCreated(function(){
    this.cdata = {
        players: new ReactiveVar([])
    }

    updateData(this);
});

Template.Players.helpers({
    players: function() {
        var tpl = Template.instance();
        return tpl.cdata.players.get();
    }
});

function updateData(tpl) {
    playersModel.getOwn(function(players){
        players = _.where(players, {coach:0})
        tpl.cdata.players.set(players)
    })
}