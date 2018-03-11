import { Mongo } from 'meteor/mongo';
import {Transfers} from './../../../../collections/collections';

function transfersModel() {
    var api = {get};

    function get(transferID) {
        return Transfers.findOne({_id: transferID});
    }

    return api;
}

export default transfersModel();