import skills from './skills.js';
Meteor.methods({
    'admin:one-time-migration:players:skills:convert': function() {
        if (this.userId !== 'wg2H3Bem7BrERkEsZ') return;
        skills.convert();
    }
})