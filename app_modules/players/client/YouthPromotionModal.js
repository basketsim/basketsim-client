Template.YouthPromotionModal.events({
    'click .confirm-promote': promote,
    'click .deny-promote': closeModal
});

function promote(event) {
    event.preventDefault();
    Meteor.call('promoteYouth', this.player._id, function(error, succ){
        if (error) {
            switch (error.error) {
                case 'not-your-player':
                sAlert.error(error.reason);
                break;
                case 'cannot-promote':
                sAlert.error(error.reason);
                break;
                case 'promote-failed':
                sAlert.error(error.reason);
                default:
                sAlert.error('An error occured. Please contact the administrator');
                break;
            }
        } else {
            sAlert.success('Player has been succesfully promoted');
            cbutils.events.fire('player:update');
        }
    });

    closeModal();
}
function closeModal() {
    Modal.hide('YouthPromotionModal');
}