function teams() {
    var api = {activeTeamsPerCountry};

    function activeTeamsPerCountry() {
        var teams = Teams.getActive();
        var apc = {};
        _.each(teams, function(team){
            if (apc[team.country]) {
                apc[team.country]++;
            } else {
                apc[team.country] = 1;
            }
        });
        console.log(apc);
    }

    return api;
}

export default teams();