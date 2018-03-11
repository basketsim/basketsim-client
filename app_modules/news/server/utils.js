function utils() {
    var api = {newEvent, validArgs, _invalidArgsSent};
    var admin_id = 'wg2H3Bem7BrERkEsZ';

    function newEvent(category, receiver_id) {
        return {
            category: category,
            timestamp: new Date().valueOf(),
            receiver_id: receiver_id
        }
    }

    function validArgs() {
        var valid = true;

        _.each(arguments, function(arg) {
            if (!arg) valid = false;
        });

        if (!valid) {
            api._invalidArgsSent();
        }

        return true;
    }

    function _invalidArgsSent() {
        var type = 'attendence-income-received';
        var event = api.newEvent('admin', admin_id);
        event.type = type;
        AdminEvents.insert(event);
    }

    return api;
}

export default utils();