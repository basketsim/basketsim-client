import {Template} from 'meteor/templating';
import {Meteor} from 'meteor/meteor';
import {sAlert} from 'meteor/juliancwirko:s-alert';
import {Modal} from 'meteor/peppelg:bootstrap-3-modal';

Template.CancelArenaUpdate.events({
    'click .cancel-update': cancelUpdate,
    'click .not-cancel-update': closeModal
});

function cancelUpdate(event) {
    event.preventDefault();
    console.log('Cancel Event', this);
    const self = this;
    Meteor.call('facilities:arena:cancelUpgrade', function(error, succ){
        if (error) {
            sAlert.error(error.reason);
        } else {
            closeModal();
            self.reactiveArenaUpdate.set(null);
            sAlert.success('Arena Update has been cancelled');
        }
    });
}
function closeModal() {
    Modal.hide('CancelArenaUpdate');
}