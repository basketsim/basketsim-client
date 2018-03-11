import {Template} from 'meteor/templating';
import utils from './../../../utils/client/api';
import Sidebar from './../layouts/Sidebar';
import { Modal } from 'meteor/peppelg:bootstrap-3-modal';


Template.ToolsModal.onRendered(function () {
    utils.initComponent(Sidebar, '#tools-container');
});

Template.ToolsModal.events({
    'click #close-modal': closeModal
});

function closeModal() {
    Modal.hide('ToolsModal');
}