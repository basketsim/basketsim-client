import matchesModel from './../../../../matches/server/models/matches-datamodel.js';
class LeagueDataModel {
    getLeagueAndInfo(country, level, series, season) {
        var league = {},
            teams = [],
            teamIDs = [],
            matches = [],
            prevMatches = [],
            nextMatches = [],
            userInfos = [],
            currentRound = 1;

        level = parseInt(level, 10);
        series = parseInt(series, 10);
        season = parseInt(season, 10);

        league = Leagues.findOne({country: country, level: level, series: series}, {fields:{
            ['seasons.'+season]: 1,
            ['stats.'+season]:1,
            name:1,
            country: 1,
            level: 1,
            change: 1,
            strength: 1,
            active: 1,
            series:1,
            currentSeason:1
        }});

        currentRound = league.seasons[season].state.round;

        teamIDs = league.seasons[season].teams.map(function(team){
            return team.team_id;
        });

        teams = Teams.find({_id: {$in: teamIDs}}, {fields: {name:1, logo:1, shirt:1}}).fetch();
        userInfos = UserInfo.find({team_id: {$in: teamIDs}}, {fields: {username:1, team_id:1}}).fetch();

        prevMatches = matchesModel.getLeagueRoundMatches(league._id, season, currentRound-1,
            {'homeTeam.id': 1,'awayTeam.id': 1,'dateTime.timestamp': 1,'competition.collection': 1,'competition.level': 1,'homeTeam.matchRatings.score': 1,'awayTeam.matchRatings.score': 1,state: 1
        });
        nextMatches = matchesModel.getLeagueRoundMatches(league._id, season, currentRound,
            {'homeTeam.id': 1,'awayTeam.id': 1,'dateTime.timestamp': 1,'competition.collection': 1,'competition.level': 1,state: 1}
        );

        matches = prevMatches.concat(nextMatches);
        composeLeague(league, season, teams, userInfos, prevMatches, nextMatches);

        return league;
    }
}

function composeLeague(league, season, teams, userInfos, prevMatches, nextMatches) {
    league.seasons[season].teams.forEach(function (team) {
        let teamInfo = _.find(teams, function(t){return t._id._str === team.team_id._str});
        let userInfo = _.find(userInfos, function(u){return u.team_id._str === team.team_id._str});
        team.logo = teamInfo.logo;
        team.shirt = teamInfo.shirt;
        team.name = teamInfo.name;
        if (userInfo) team.managerName = userInfo.username
    });

    league.seasons[season].matches = {
        previous: prevMatches,
        next: nextMatches
    }
}

export default new LeagueDataModel();