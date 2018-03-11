import get from './get.js';
import model from './model.js'

Meteor.methods({
    getLatestEvents: get.latestEvents,
    'news:admin:removeOldNews': removeOldNews
});

function removeOldNews() {
    if (!sbutils.validations.isAdmin(this.userId)) return;
    model.deleteTwoWeeksOld();
}

