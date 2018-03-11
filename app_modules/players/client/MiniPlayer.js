import teamModel from './../../teams/client/models/team-clientmodel.js';

Template.MiniPlayer.onCreated(function(){
    this.cdata = {
        team: new ReactiveVar([])
    }

    updateData(this);
});

function updateData(tpl) {
    teamModel.getOwn(function(team){
        tpl.cdata.team.set(team)
    });
}

Template.MiniPlayer.helpers({
    jersey: function () {
        var tpl = Template.instance();
        var team = tpl.cdata.team.get();
        return team.shirt;
    },
    initials: function() {
        return this.name[0] + '.' + this.surname[0] + '.';
    },
    checkType: function() {
        if (this.player.coach === 0) {
            return 'players';
        } else if (this.player.coach === 9) {
            return 'youth';
        }
    }
});