Meteor.publish('international-phoenix', function () {
    var team = Teams.getByUserid(this.userId);
    var fetchedTeams;
    var teamIds = [];
    var groupIndex = team.competitions.phoenixCup.group;

    var fields = {
        edition: true,
        state: true
    };
    fields['groups.g'+groupIndex] = true;
    console.log('fields', fields);
    var phoenix = PheonixTrophy.find({}, {fields: fields});

    var groupTeams = [];
    var teams = [];

    _.each(phoenix.fetch()[0].groups['g'+groupIndex].teams, function(team){
        groupTeams.push(team._id);
    });
    console.log('group Teams', groupTeams);

    teams = Teams.find({_id: {$in:groupTeams}}, {fields:{
        name: true,
        shirt: true,
        competitions: true
    }});
    fetchedTeams = teams.fetch();
    _.each(fetchedTeams, function(t){
        teamIds.push(t._id);
    });


    var userInfo = UserInfo.find({team_id: {$in: teamIds}}, {fields: Fields.userinfo.restricted});

    return [phoenix, teams, userInfo];
});

/**
 * This is using the publishComposite and manages the dependencies per published object
 * It might be a bit easier to use, or at least might provide more usability, so check if this should be used instead of my way
 */
Meteor.publishComposite('phoenix-playoff', function(limit, roundInt) {
    roundInt = roundInt || 1;
    if (!this.userId) return this.ready();
    var phoenix = PheonixTrophy.find().fetch()[0];
    var round = 'round'+roundInt;
    console.log('round', round);
    var matchesArray = phoenix.playoff[round].matches || [];
    var matches = Matches.find({_id: {$in:matchesArray}}, {fields:Fields.matches.restricted, limit:limit});
    return {
        find: function() {
            return matches;
        },
        children: [
            {
                find: function(match) {
                    return Teams.find({_id: {$in:[match.homeTeam.id, match.awayTeam.id]}}, {fields: Fields.teams.restricted});
                }
            }
        ]
    };
});