Template.PlayerList.helpers({
	'player': player,
	'display': display,
	'selectedClass': selectedClass
});

Template.PlayerList.events({
	'click li': setSelectedPlayer,
	'submit .new-players': submitPlayers,
});

/* HELPERS */
function display() {
	return 'this displays stuff';
}

function player() {
	return Players.find();
}

function selectedClass() {
	var playerId = this._id;
	var selectedPlayer = Session.get('selectedPlayer');
	if (playerId === selectedPlayer) {
		return 'selected';
	}
}

/* EVENTS */
function setSelectedPlayer() {
	Session.set('selectedPlayer', this._id);
}

function submitPlayers(event) {
	var amount = event.target.amount.value;
	var team = event.target.team.value;
	//generate players
	_generatePlayer(amount, team);

	//clean input
	event.target.amount.value = "";
	event.target.team.value = "";
	return false;
}

/* PRIVATE */
function _isThisPublic() {
}

function _generatePlayer(amount, team) {
	var players = [];
	var player = {
		attrs: {
			handling: 0, passing: 0, rebounds: 0, shooting: 0, defense: 0, experience: 0,
			quickness: 0, driibling: 0, positioning: 0, freethrows: 0, wr: 0, tiredness: 0,
			character: 'stable', height: 200, weight: 95
		},
		name: '',
		team: ''
	};

	for (var i = 0; i< amount; i++) {
		for (var attr in player.attrs) {
			player.attrs[attr] = Math.round(Math.random() * 20);
		}
		player.attrs.character = 'stable';
		player.attrs.height = 200;
		player.attrs.weight = 95;

		player.name = 'Player ' + (i+1) + team;
		player.team = Teams.findOne({name: team})._id;

		players.push(player);
		//insert players
		Players.insert(player, function(err, records){
			//push player into Team
			Teams.update({_id:Teams.findOne({name: team})._id}, {$push:{players: records}});
		});
	}

	//update team
	//Team.update({_id:Team.findOne({name: team})._id}, {$pushAll: {players: players}});
}

