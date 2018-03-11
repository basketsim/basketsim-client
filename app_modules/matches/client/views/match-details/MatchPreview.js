Template.MatchPreview.helpers({
    getTime: getTime
});

Template.MatchPreview.events({
    'click .add-to-live': addToLive
})

function getTime(timestamp) {
    return moment(timestamp).format('dddd, MMM Do YYYY, HH:mm');
}

function addToLive(event) {
    event.preventDefault();
    console.log('add to live', this.match._id);
    Meteor.call('updateLive', this.match._id, function(error){
        if (error) {
            sAlert.error(error.reason);
        } else {
            sAlert.success('Good choice! Match can be seen live!');
        }
    });
}