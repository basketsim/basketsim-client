Meteor.methods({
    'game-info:get': function () {
        return GameInfo.findOne();
    }
});