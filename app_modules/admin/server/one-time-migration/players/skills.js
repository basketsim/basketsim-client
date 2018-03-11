function skills() {
    var api = {convert, _getIDs, _update};

    /**
     * Goes through all players owned by active teams and if the skills are in string format, converts them to floats
     * @return {[type]} [description]
     */
    function convert() {
        console.log('conversion started');
        var teams = Teams.getActiveIDs();
        var teamIDs = _getIDs(teams);
        var players = Players.find({coach: 0, team_id: {$in: teamIDs}}).fetch();

        console.log('conversion updates started');
        api._update(players);
        console.log('conversion ended');
    }

    function _update(players) {
        var skills = ['height','weight', 'handling', 'quickness', 'passing', 'dribbling', 'rebounds', 'positioning', 'shooting', 'defense', 'experience', 'workrate', 'freethrow'];
        _.each(players, function(player, i){
            var efound = false;
            if (player._id._str === '55cf060f1cc5f84ae62a5cd2') {
                efound = true;
                console.log('modric found');
            }
            let hasString = false;
            let newSkills = {};
            _.each(skills, function(skill){
                if (efound) {
                    console.log(skill, player[skill], typeof player[skill]);
                }
                if (typeof player[skill] === 'string') hasString = true;
            });

            if (efound) console.log('hasString', hasString);
            if (hasString) {
                let hasNAN = false;
                _.each(skills, function(skill){
                    newSkills[skill] = parseFloat(player[skill]);
                });
                _.each(newSkills, function(val, prop){
                    if (Number.isNaN(Number(val))) {
                        hasNAN = true;
                        console.log('player has nan', player._id, prop);
                    }
                });

                if (efound) console.log('hasNAN', hasNAN, 'newSkills', newSkills);
                if (!hasNAN) {
                    Players.update({_id: player._id}, {$set: newSkills});
                    console.log('uptated player skills', i+1, '/', players.length);
                }
            }
        });
    }

    function _getIDs(collection) {
        var ids = [];
        _.each(collection, function(item){
            ids.push(item._id);
        });

        return ids;
    }

    return api;
}

export default skills();