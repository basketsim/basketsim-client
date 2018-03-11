import players from './../../players/server/api.js'

Meteor.methods({
    'crons:methods:updateEV': function () {
        if (this.userId !== 'wg2H3Bem7BrERkEsZ') return;
        players.ev.update();
    }
});