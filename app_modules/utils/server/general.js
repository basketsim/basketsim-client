function general() {
    var api={userinfoID};

    function userinfoID(userID) {
        return Meteor.users.findOne({_id: userID}, {fields:{userInfo_id:1}}).userInfo_id;
    }

    return api;
}

export default general();