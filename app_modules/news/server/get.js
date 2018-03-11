function get () {
    var api = {latestEvents};

    function latestEvents() {
        var team = Teams.getByUserid(this.userId);
        return Events.find({receiver_id: team._id}, {sort: {timestamp: -1}}).fetch();
    }

    return api;
}

export default get();