function arena() {
    var api = {insert, reset, create};


    function insert(name, teamID) {
        var arena = api.create(name, teamID);
        Arenas.insert(arena);
    }

    function reset(name, teamID) {
        var arena = api.create(name, teamID);
        Arenas.update({team_id: teamID}, arena);
    }

    function create(name, teamID) {
        var arena = {
          createdAt: new Date(),
          arenaname: name,
          team_id: teamID,
          court_side: 1500,
          court_end: 1000,
          upper_level: 0,
          vip: 0,
          in_use: 0,
          upgrade_date: null,
          fans: 250,
          cheer_name: '',
          cheer_logo: '',
          cheer_week: 0,
          week_ideal: 0,
          cheer_season: 0,
          season_ideal: 0
        }

        return arena;
    }

    return api;
}

export default arena();