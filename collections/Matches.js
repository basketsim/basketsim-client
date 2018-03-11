/*
Matches Schema:
id: int
homeTeam: {
	id:
	starting5: {
		pg: playerID,
		sg: playerID,
	...
	}
	subs: {
		pg: playerID
	...
	}
		tactics: tacticID
}
awayTeam: {},
date: {},
arena: {}
pointsScored: {
	homeTeam: 0,
	awayTeam: 0
},
teamRatings: {
	homeTeam: {
		2p shooting: average,
		3p shooting: below average,
		Rebounding: poor,
		Turnovers: good,
		Tiredness: 10%,
	}
	awayTeam: {

	}
}
matchView: urlToFile

 */

//hasPlayed - when live ended and leaderboards can be updated
//hasStarted - when live starts (actual time of have)
//wasSimulated - when the match outcome is generated
global.Matches = new Mongo.Collection('matches');

Matches.getFull = function (matchId) {
	var teams = ['homeTeam', 'awayTeam'];
	var match = {
		_id: matchId,
	};
	var rawMatch = Matches.findOne({_id: matchId});
	var team;
	//Don't use this for users without rights to see the lineups of other teams
	for (var i=0; i< teams.length; i++) {
		team = Teams.getRaw(rawMatch[teams[i]].id);

		if (rawMatch[teams[i]].tacticsSet || !team.tactics) {
			// console.log('team set, getFull rawMatch',rawMatch[teams[i]].tacticsSet, !team.tactics);
			match[teams[i]] = {
				info: Teams.getRaw(rawMatch[teams[i]].id),
				startingFive: _getLineup(rawMatch[teams[i]].startingFive),
				subs: _getLineup(rawMatch[teams[i]].subs),
				defensive: rawMatch[teams[i]].defensive,
				offensive: rawMatch[teams[i]].offensive
			};
		} else {
			// console.log('team not set getFull rawMatch',team.tactics.defensive, team.tactics.offensive);
			match[teams[i]] = {
				info: team,
				startingFive: _getLineup(team.tactics.startingFive),
				subs: _getLineup(team.tactics.subs),
				defensive: team.tactics.defensive,
				offensive: team.tactics.offensive
			};
		}

		// console.log(match[teams[i]], 'inspected');
	}
	console.log('getFull match end');


	return match;
};

Matches.getMatchInfo = function(matchId) {
	var match = Matches.findOne({_id: matchId});
	var homeTeam = Teams.getRaw(match.homeTeam.id);
	var awayTeam = Teams.getRaw(match.awayTeam.id);
	match.homeTeam = homeTeam;
	match.awayTeam = awayTeam;

	return match;
};

// Matches.getFull = function(matchId) {
// 	console.log(matchId);
// 	var teams = ['homeTeam', 'awayTeam'];
// 	var rawMatch = Matches.findOne({_id: matchId});
// };

Matches.getRaw = function(matchId) {
	return Matches.findOne({_id: matchId});
};

function _getLineup(lineupObj) {
	var lineup = {};
	// if (lineupObj === undefined || lineupObj === null) {
	// 	return {};
	// }

	for (var player in lineupObj) {
		if (lineupObj.hasOwnProperty(player)) {
			lineup[player] = Players.getRaw(lineupObj[player].player_id);
		}
	}
	return lineup;
}

export default Matches;
