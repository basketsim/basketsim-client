import BadWordsFilter from 'bad-words';

function validations() {
    var api = {userOwnsPlayer, teamOwnsPlayer, isAdmin, profanity};

    function userOwnsPlayer(userid, player_id) {
        var player = Players.findOne({_id: player_id});
        var team = Teams.getByUserid(userid);

        return teamOwnsPlayer(team, player);
    }

    function teamOwnsPlayer(team, player) {
        if (player.team_id._str === team._id._str) {
            return true;
        } else {
            return false;
        }
    }

    function isAdmin(userID) {
        if (userID === 'wg2H3Bem7BrERkEsZ') return true;
        return false;
    }

    function profanity(str) {
        var status = {
            valid: true,
            error: null
        };
        var filter = new BadWordsFilter();
        filter.addWords(['Goosy', 'goosy', 'basketsim']);

        if (filter.isProfane(str)) {
            var status = {
                valid: false,
                error: 'cannot contain profane or reserved words'
            };
        }

        return status;
    }



    return api;
}

export default validations();