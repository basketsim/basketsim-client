function get() {
    var api = {cursor, one, teamOnPlace};

    /**
     * [teamOnPlace description]
     * @param  {[type]} place [description]
     * @return {[type]}       [description]
     */
    function teamOnPlace(place, season) {
        var teams = _.sortBy(_.sortBy(_.sortBy(season.teams, 'scored'), 'difference'), 'win').reverse();
        return teams[place - 1];
    }

    /**
     * [league description]
     * @return {[type]} [description]
     */
    function cursor(selector, options) {
        return Leagues.find(selector, options);
    }

    function one(selector, options) {
        return Leagues.findOne(selector, options);
    }

    return api;
}

export default get();