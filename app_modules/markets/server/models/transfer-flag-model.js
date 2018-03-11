import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { TransferFlags } from './../../../../collections/collections';

function transferFlag(){
    const api = {create, insert, getAll, updateComment};

    function insert(transferIDStr, userID) {
        const flag = create(transferIDStr, userID);
        const unique = isUnique(flag.transfer_id, flag.flagger_userinfo_id);
        if (unique) {
            TransferFlags.insert(flag);
        } else {
            throw new Meteor.Error('not-unique', 'You have already flagged this transfer');
        }
    }

    function create(transferIDStr, userID) {
        const userInfoID = Meteor.users.findOne({_id: userID}, {fields: {userInfo_id: 1}}).userInfo_id;
        const flag = {
            transfer_id: new Mongo.ObjectID(transferIDStr),
            flagger_userinfo_id: userInfoID,
            flagger_comment: '',
            flag_score: null,
            scorer_user_id: null,
            date: new Date()
        };

        return flag;
    }

    function updateComment(transferID, comment, userInfoID) {
        TransferFlags.update({transfer_id: transferID, flagger_userinfo_id: userInfoID}, {$set:{flagger_comment: comment}});
    }

    function isUnique(transferID, flaggerID) {
        const flag = TransferFlags.findOne({transfer_id: transferID, flagger_userinfo_id: flaggerID});
        if (flag) return false;
        return true;
    }

    function getAll() {
        // var pipe = [
        //     {
        //         $lookup: {
        //         from: 'transfers-archive',
        //         localField: 'transfer_id',
        //         foreignField: '_id',
        //         as: 'transfer'
        //         }
        //     },
        //     { $unwind: '$transfer' }
        // ];
        // var flags = TransferFlags.aggregate(pipe);

        return TransferFlags.find({ flag_score:null }).fetch();
    }

    return api;
}

export default transferFlag();