Meteor.methods({
    teamNameById: function (team_id) {
        if (!team_id) return 'Unemployed';
        return Teams.findOne({_id: team_id}, {fields:{name:true}}).name;
    }
});