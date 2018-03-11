class MatchesDataModel {
    getPlayedByTeamID(teamID, composed) {
        var time = new Date().valueOf();
        var matches = [],

        matches = Matches.find(
            {
                'state.finished':true,
                $or: [{'homeTeam.id': teamID}, {'awayTeam.id': teamID}]
            },
            {
                fields: {
                    'homeTeam.id': 1,
                    'awayTeam.id': 1,
                    'homeTeam.matchRatings.score': 1,
                    'awayTeam.matchRatings.score': 1,
                    'dateTime.timestamp': 1,
                    'competition.collection': 1,
                    'competition.level': 1,
                    state: 1
                }
            }).fetch();

        if (composed) joinTeamNames(matches);
        // console.log('getPlayedByTeamID matches received in', new Date().valueOf() - time, 'miliseconds');
        return matches;
    }
    getOwnUnfinished(reqID, composed) {
        var time = new Date().valueOf();
        var matches = [];
        var userinfoID = sbutils.general.userinfoID(reqID);
        var teamID = UserInfo.findOne({_id: userinfoID}, {fields: {team_id: 1}}).team_id;
        matches = Matches.find(
            {
                'state.finished':false,
                $or: [{'homeTeam.id': teamID}, {'awayTeam.id': teamID}]
            },
            {
                fields: {
                    'homeTeam.id': 1,
                    'awayTeam.id': 1,
                    'homeTeam.tacticsSet':1,
                    'awayTeam.tacticsSet':1,
                    'dateTime.timestamp': 1,
                    'competition.collection': 1,
                    'competition.level': 1,
                    state: 1
                }
            }).fetch();

        if (composed) joinTeamNames(matches);
        console.log('getOwnUnfinished matches received in', new Date().valueOf() - time, 'miliseconds');
        return matches;
    }
    getOwnFinished(reqID, composed) {
        console.log('get own finished');
        var matches = [];
        var userinfoID = sbutils.general.userinfoID(reqID);
        var teamID = UserInfo.findOne({_id: userinfoID}, {fields: {team_id: 1}}).team_id;
        matches = Matches.find(
            {
                'state.finished':true,
                $or: [{'homeTeam.id': teamID}, {'awayTeam.id': teamID}]
            },
            {
                fields: {
                    'homeTeam.id': 1,
                    'awayTeam.id': 1,
                    'homeTeam.matchRatings.score': 1,
                    'awayTeam.matchRatings.score': 1,
                    'dateTime.timestamp': 1,
                    'competition.collection': 1,
                    'competition.level': 1,
                    state: 1
                }
            }).fetch();

        if (composed) joinTeamNames(matches);
        return matches;
    }

    getByID(reqID, matchID, composed) {
        var match = {},
            responseMatch = {};

        match = Matches.findOne({_id: matchID}, {fields:{'homeTeam.id': 1,'awayTeam.id': 1, state:1, dateTime: 1, competition:1}});
        addDisplayState(reqID, match);

        if (match.displayState === 'UNFINISHED_OWN') {
            responseMatch = Matches.findOne({_id: matchID}, {fields:{
                'homeTeam.id': 1,
                'awayTeam.id': 1,
                state: 1,
                dateTime: 1,
                [match.ownTeam]: 1
            }});

        } else if (match.displayState === 'UNFINISHED_NOT_OWN') {
            responseMatch = match;
        } else if (match.displayState === 'LIVE') {
            responseMatch = match;
        } else if (match.displayState === 'FINISHED') {
            responseMatch = Matches.findOne({_id: matchID});
        }

        responseMatch.displayState = match.displayState;
        responseMatch.ownTeam = match.ownTeam;

        if (composed) joinTeamNames([responseMatch]);
        return responseMatch;
    }

    getLeagueRoundMatches(competionID, season, round, fields) {
        var matches = Matches.find(
            {
                'competition._id': competionID,
                'competition.season': season,
                'competition.round': round
            },
            {
                fields: fields
            }
        ).fetch();

        joinTeamNames(matches);

        return matches;
    }
}

function addDisplayState(reqID, match) {
    var ownInMatch = false;

    ownInMatch = isOwnInMatch(reqID, match);

    if (!match.state.simulated) {
        if (ownInMatch) {
            match.displayState = 'UNFINISHED_OWN';
        } else {
            match.displayState = 'UNFINISHED_NOT_OWN';
        }
    } else if (match.state.simulated && !match.state.finished) {
        match.displayState = 'LIVE';
    } else if (match.state.finished) {
        match.displayState = 'FINISHED';
    }
}

/**
 * Check if the team id of own team is present in the match object, as home or away team
 * Also ads which team is own on the match object, by modifiying it and appending ownTeam property
 */
function isOwnInMatch(reqID, match) {
    var userinfoID = {},
        teamID = {};

    userinfoID = sbutils.general.userinfoID(reqID);
    teamID = UserInfo.findOne({_id: userinfoID}, {fields: {team_id: 1}}).team_id;

    if (teamID._str === match.homeTeam.id._str) {
        match.ownTeam = 'homeTeam';
        return true;
    } else if (teamID._str === match.awayTeam.id._str) {
        match.ownTeam = 'awayTeam';
        return true;
    } else {
        match.ownTeam = null;
        return false;
    }
}

function joinTeamNames(matches) {
    var teamIDs = [],
        teams = [];

    matches.forEach(function (match) {
        teamIDs.push(match.homeTeam.id);
        teamIDs.push(match.awayTeam.id);
    });

    teams = Teams.find({_id: {$in: teamIDs}}, {fields: {name:1, logo:1}}).fetch();

    matches.forEach(function (match) {
        let homeTeam = _.find(teams, function(team){
            return team._id._str === match.homeTeam.id._str;
        });
        let awayTeam = _.find(teams, function(team){
            return team._id._str === match.awayTeam.id._str;
        });

        match.homeTeam.name = homeTeam.name;
        match.awayTeam.name = awayTeam.name;
        match.homeTeam.logo = homeTeam.logo;
        match.awayTeam.logo = awayTeam.logo;
    });
}

export default new MatchesDataModel();