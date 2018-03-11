Template.Match.helpers({
	'match' : getMatches,
	'position': getPositions,
	'argTest': argTest,
	'players': getPlayers
});

Template.Match.events({

});

/* Others */
// var testTeams = {
// 	homeTeam: 'All Stars Ploiesti',
// 	awayTeam: 'Bot'
// };

/* HELPERS */
function getMatches () {
	return Matches.find();
}

function getPositions() {
	return ['PG', 'SG', 'SF', 'PF', 'C'];
}

function getTeams() {
	return Teams.find({name: {$in:['All Stars Ploiesti', 'Bot']}}).fetch();
}

function argTest(passArg) {
	return Teams.findOne({name: passArg});
}

function getPlayers(teamName) {
	if (!Teams.findOne({name: teamName})) return;
	var teamId = Teams.findOne({name: teamName})._id;
	return Players.find({team: teamId});
}



/* EVENTS */