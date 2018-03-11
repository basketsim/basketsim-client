function players () {
    var api = {checkNan};

    function checkNan() {
        var skills = ['handling', 'quickness', 'passing', 'dribbling', 'rebounds', 'positioning', 'shooting', 'defense', 'experience', 'workrate', 'freethrow'];
        _.each(skills, function(skill){
            let finder = {};
            let setter = {};
            finder[skill] = Number.NaN;
            finder.coach = 9;
            setter[skill] = butils.math.intRandRange(56, 74);
            let ps = Players.find(finder).fetch();
            console.log(skill, ps.length);

            _.each(ps, function(player) {
                Players.update({_id: player._id}, {$set: setter});
            });
        });
    }

    return api;
}

export default players();