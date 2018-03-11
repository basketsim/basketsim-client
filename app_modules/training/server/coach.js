import finances from './../../finances/server/api.js';

function coach() {
    var api = {renewCoachContract, _userOwnsPlayer, _teamOwnsPlayer, _validate};

    /**
     * Validate input
     * Update motivation
     * Subtract money
     * Log contract renewal - not implemented
     */
    function renewCoachContract(userid, coach_id) {
        var coach = Players.findOne({_id: coach_id});
        var team = Teams.getByUserid(userid);

        api._validate(team, coach);

        // update motivation
        Players.update({_id: coach_id}, {$set:{motiv:105}});

        //subtract price
        Teams.update({_id: team._id}, {$inc: {
            curmoney: -coach.price
        }});

        //update temp money
        finances.spending.update(team._id);
    }

    function _validate(team, coach) {
        if (!api._teamOwnsPlayer(team, coach)) throw new Meteor.Error("not-your-coach", "Looks like this is not your coach");
        if (team.curmoney - coach.price < 0) throw new Meteor.Error("not-enough-money", ":( You don't have enough money for renewal");
    }

    function _userOwnsPlayer(userid, player_id) {
        var coach = Players.findOne({_id: coach_id});
        var team = Teams.getByUserid(userid);

        return _teamOwnsPlayer(team, coach);
    }

    function _teamOwnsPlayer(team, player) {
        if (player.team_id._str === team._id._str) {
            return true;
        } else {
            return false;
        }
    }

    return api;
}

export default coach();