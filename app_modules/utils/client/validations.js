function validations() {
    var api = {isAdmin};

    function isAdmin(userID) {
        if (Meteor.userId() === 'wg2H3Bem7BrERkEsZ') return true;
        return false;
    }

    return api;
}

export default validations();