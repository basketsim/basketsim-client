var place = 0;
Template.International.events({

});

Template.International.helpers({
    getTeams: function() {
        var phoenix = PheonixTrophy.find({}).fetch()[0];
        var team = Session.get('team');
        var groupIndex = team.competitions.phoenixCup.group;
        var group = phoenix.groups['g'+groupIndex];
        // var groupTeams = [];
        // var teams = [];

        // _.each(phoenix.fetch()[0].groups[groupIndex].teams, function(team){
        //     groupTeams.push(team._id);
        // });

        // teams = Teams.find({_id: {$in:groupTeams}}, {fields:{
        //     name: true,
        //     shirt: true
        // }});

        return _.sortBy(_.sortBy(group.teams, 'pointsDifference'), 'wins').reverse();
    },
    userinfoId: function(team) {
        return UserInfo.findOne({team_id: team._id})._id._str;
    },
    scoreDiff: function(team) {
        return team.scoredPoints - team.againstPoints;
    },
    place: function () {
        if (place === 8) place = 0;
        place ++;
        return place;
    },
    name: function() {
        var team = Teams.findOne({_id: this._id});
        return team.name;
    }
});