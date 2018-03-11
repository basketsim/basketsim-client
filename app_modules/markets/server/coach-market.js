/* global Players */
import players from './../../players/server/api.js';
import finances from './../../finances/server/api.js';
function coach() {
    var api = {hire, _validate, maintain};

    function hire(newCoach_id) {
        var coach = Players.findOne({_id: newCoach_id});
        var team = Teams.getByUserid(this.userId);

        _validate(coach, team);

        //fire old coach
        Players.update({coach:1, team_id: team._id}, {$set:{
            motiv: 105,
            releasedAt: new Date().valueOf(),
            team_id: null
        }});

        //hire new coach
        Players.update({_id: newCoach_id}, {$set:{
            motiv: 105,
            team_id: team._id
        }});

        //subtract price
        Teams.update({_id: team._id}, {$inc: {
            curmoney: -coach.price
        }});

        //update temp money
        finances.spending.update(team._id);
    }

    function _validate(coach, team) {
        if (!coach) throw new Meteor.Error("coach-not-found", "This coach was not found. Please refresh and try again");
        if (!team) throw new Meteor.Error("team-not-found", "Team not found for current user");
        if (coach.team_id) throw new Meteor.Error("coach-not-available", "Oops! Somebody was faster and got the coach before you");
        if (team.curmoney - coach.price < 0) throw new Meteor.Error("not-enough-money", ":( You don't have enough money for this coach");
    }

    function maintain() {
        var limit = 50;
        var coaches = Players.find({coach:1, team_id:null}, {sort:{releasedAt:1}}).fetch();
        var diff = coaches.length - limit;

        for (var i=0; i<diff; i++) {
            Players.remove({_id: coaches[i]._id});
        }

        if (diff<0) {
            diff = diff * -1;
            for (var j = 0; j < diff; j++) {
                Players.insert(players.coach.create());
            }
        }

        for (var k = 0; k < 5; k++) {
            Players.remove({_id: coaches[k]._id});
            Players.insert(players.coach.create());
        }
    }

    return api;
}

export default coach();