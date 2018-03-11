Template.FirePlayer.events({
    'click .fire-player': firePlayer,
    'click .not-fire-player': closeModal
});

function firePlayer(event) {
    event.preventDefault();
    Meteor.call('firePlayer', this.player._id, function(error, succ){
        if (error) {
            sAlert.error(error.reason);
        } else {
            cbutils.events.fire('player:update');
            closeModal();
            sAlert.success('Player has been fired');
        }
    });
}
function closeModal() {
    Modal.hide('FirePlayer');
}