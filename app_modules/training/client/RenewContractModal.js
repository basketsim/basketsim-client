Template.RenewContractModal.events({
    'click .renew': renew,
    'click .not-renew': closeModal
});

Template.RenewContractModal.helpers({
    dotify: dotify
});

function renew(event) {
    event.preventDefault();
    Meteor.call('renewCoachContract', this.coach._id, function(error, succ){
        if (error) {
            sAlert.error(error.reason);
        } else {
            sAlert.success('Contract has been renewed');
            closeModal();
        }
    });
}
function closeModal() {
    Modal.hide('RenewContractModal');
}

function dotify(x) {
    if (!x) return;
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return parts.join(".");
}