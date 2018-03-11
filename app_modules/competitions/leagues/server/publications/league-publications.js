/**
 * This is using the publishComposite and manages the dependencies per published object
 * It might be a bit easier to use, or at least might provide more usability, so check if this should be used instead of my way
 */
Meteor.publishComposite('league', function(country, level, series, season) {
    console.log('publish league', season);
    if (!this.userId) return this.ready();
    var leagues = Leagues.find({country: country, level: parseInt(level), series: parseInt(series)});
    return {
        find: function() {
            return leagues;
        },
        children: [
            {
                find: function(league) {
                    var teamIds = [];
                    var curr = season || league.currentSeason;
                    _.each(league.seasons[curr].teams, function(team){
                        teamIds.push(team.team_id);
                    });
                    return Teams.find({_id: {$in: teamIds}}, {fields: Fields.teams.restricted});
                }
            },
            {
                find: function(league) {
                    var teamIds = [];
                    var curr = season || league.currentSeason;
                    _.each(league.seasons[curr].teams, function(team){
                        teamIds.push(team.team_id);
                    });
                    return UserInfo.find({team_id: {$in: teamIds}}, {fields: Fields.userinfo.restricted});
                }
            },
            {
                find: function(league) {
                    var round = league.seasons[league.currentSeason].state.round;
                    var matches = Matches.find({'competition._id': league._id, 'competition.season':league.currentSeason, 'competition.round':{$in: [round-1, round]}});
                    return matches;
                }
            }
        ]
    };
});