Template.MatchSim.helpers({
	'init': init,
});
Template.MatchSim.events({

});

function init (match) {
	console.log(match);
	GameEngine.init(match);
}