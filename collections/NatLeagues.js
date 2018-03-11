global.NatLeagues = new Mongo.Collection('natLeagues');

NatLeagues.getRaw = function(lid) {
    return NatLeagues.findOne({_id: lid});
};

NatLeagues.getFull = function(lid) {
    var league = NatLeagues.findOne({_id: lid});
    if (!league) return {};
    var fullLeague;

    for (var i=0; i< league.teams.length; i++) {
        _.extend(league.teams[i], Teams.findOne({_id: league.teams[i].team_id}));
        league.teams[i].user = UserInfo.findOne({team_id: league.teams[i].team_id});
    }

    return league;
};