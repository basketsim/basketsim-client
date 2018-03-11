import migrations from './migrations.js'

Meteor.methods({
    'achievements:migrate':function() {
        if (!sbutils.validations.isAdmin(this.userId)) return;
        console.log('migrate achievements clicked');
        migrations.run();
    },
    'achievements:setfpc':function() {
        if (!sbutils.validations.isAdmin(this.userId)) return;
        console.log('reset achievements clicked');
        migrations.setFPC();
    },
    'achievements:decode':function() {
        if (!sbutils.validations.isAdmin(this.userId)) return;
        console.log('decode achievements clicked');
        migrations.decodeHistName();
    },
    'achievements:reset':function() {
        if (!sbutils.validations.isAdmin(this.userId)) return;
        console.log('reset achievements clicked');
        migrations.reset();
    }
});