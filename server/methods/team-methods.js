Meteor.methods({
    getTeam: getTeam,
    getMatch: getMatch,
    updateTactics: updateTactics,
    updateDefaultTactics: updateDefaultTactics,
    getScore: getScore,
    getClubByTeam: getClubByTeam

});

function getMatch(matchid) {
    var match;
    match = Matches.findOne({_id:matchid});
    match.homeTeam = getTeam(match.homeTeam.id);
    match.awayTeam = getTeam(match.awayTeam.id);

    return match;
}

function getScore(matchid) {
    var match = Matches.findOne({_id:matchid});
    return match.homeTeam.matchRatings.score + ' - ' + match.awayTeam.matchRatings.score;
}

/**
 * Return team based on user rights to see that team
 * @param  {[type]} teamId [description]
 * @return {[type]}        [description]
 */
function getTeam(teamId) {
    var team;
    if (ownTeam(teamId, this.userId)) {
        team = Teams.findOne({_id: teamId});
    } else {
        team = Teams.findOne({_id: teamId}, {fields:{
            arena_name: true,
            city: true,
            country: true,
            logo: true,
            name: true,
            short_name: true
        }});
    }
    return team;
}

function ownTeam(teamId, userId) {
    var own = Teams.getByUserid(userId);
    if (own._id._str === teamId._str) {
        return true;
    } else {
        return false;
    }
}

function updateTactics(matchid, whichTeam, tactics) {
    var match = Matches.findOne({_id: matchid});
    var updatable = {
    };
    updatable[whichTeam] = tactics;
    updatable[whichTeam].id = match[whichTeam].id;
    updatable[whichTeam].tacticsSet = true;
    console.log(matchid, whichTeam, updatable);
    Matches.update({_id: matchid}, {$set : updatable});
}

function updateDefaultTactics(matchid, whichTeam, tactics) {
    var match = Matches.findOne(matchid);
    var team = Teams.findOne({_id: match[whichTeam].id});
    delete tactics.id;
    delete tactics.tacticsSet;

    // check if tactics object exists on team, else, create it
    if (!team.tactics) {
        team.tactics = {};
    }

    Teams.update({_id: team._id}, {$set: {tactics: tactics}});
}

function getClubByTeam(teamStringId) {
    var club = UserInfo.findOne({team_id: new Mongo.ObjectID(teamStringId)});
    if (club) {
        return club._id._str;
    } else {
        return 'bot';
    }
}