Template.ExternalPlayerInfo.onCreated(function(){
    var self = this;
    this.cdata = {
        teamName: new ReactiveVar(null)
    }

    this.autorun(function(){
        let player = Template.currentData().player;
        if (player) {
            Meteor.call('teamNameById', player.team_id, function (error, result) {
                self.cdata.teamName.set(result);
            });
        }
    })
});

Template.ExternalPlayerInfo.helpers({
    getTeamName: function () {
        var tpl = Template.instance();
        return tpl.cdata.teamName.get();
    },
    isOnSale: function(player) {
        var tpl = Template.instance();
        if (!tpl.data.player) return;
        if (tpl.data.player.transfer_id) return true;
        return false;
    },
    isSenior: function(player) {
        var tpl = Template.instance();
        if (!tpl.data.player) return;
        if (tpl.data.player.coach===9) {
            return false;
        } else {
            return true;
        }
    },
    dotify: dotify
});

function dotify(x) {
    if (!x) return;
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return parts.join(".");
}