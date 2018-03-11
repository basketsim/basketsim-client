import test from './main.js'
Meteor.methods({
    "competitions:leagues:test:play-season": function () {
        if (!sbutils.validations.isAdmin(this.userId)) return;
        test.playSeason();
    }
});