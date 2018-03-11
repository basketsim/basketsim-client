class MatchesActions {
    submitTactics(reqID, matchID, tactics) {
        // var time = new Date().valueOf();
        var userinfoID = sbutils.general.userinfoID(reqID);
        var teamID = UserInfo.findOne({_id: userinfoID}, {fields: {team_id: 1}}).team_id;

        var match = Matches.findOne({_id: matchID}, {fields: {'homeTeam.id':1, 'awayTeam.id':1}});
        console.log('match found', match);
        var ownTeam = whichTeam(match, teamID);

        if (!ownTeam) throw new Meteor.error('team-not-in-match', 'You cannot submit the tactics, as your team is not involved in the match');

        Matches.update({_id: matchID}, {$set:{
            [ownTeam + '.startingFive']: tactics.startingFive,
            [ownTeam + '.subs']: tactics.subs,
            [ownTeam + '.defensive']: tactics.defensive,
            [ownTeam + '.offensive']: tactics.offensive,
            [ownTeam + '.tacticsSet']: true,
            [ownTeam + '.tacticsSubmitTime']: new Date()
        }}, function(){});

        // console.log('submitTactics took', new Date().valueOf() - time, 'miliseconds');
    }

    submitDefaultTactics(reqID, tactics) {
        var userinfoID = sbutils.general.userinfoID(reqID);
        var teamID = UserInfo.findOne({_id: userinfoID}, {fields: {team_id: 1}}).team_id;

        Teams.update({_id: teamID}, {$set:{
            tactics: tactics
        }}, function(){});
    }
}

function whichTeam(match, teamID) {
    if (match.awayTeam.id._str === teamID._str) {
        return 'awayTeam';
    } else if (match.homeTeam.id._str === teamID._str) {
        return 'homeTeam';
    } else {
        return null;
    }
}

export default new MatchesActions();