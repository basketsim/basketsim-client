/*
Player Schema:
id: int,
name: string,
statement: string
team: teamid,
age: int,
country: id,
ev: number,
wage: number,
attrs: {
	handling, passing, rebounds, shooting, defense, experience, quickness, driibling, positioning, freethrows, wr, tiredness,
	character, height, weight,
}
 */
global.Players = new Mongo.Collection('players', {idGeneration: 'MONGO'});

Players.getRaw = function(playerID) {
	return Players.findOne({_id: playerID});
};

Players.getByTeamIds = function(arrayOfTeams, rights) {
    var players;
    if (rights === 'RESTRICTED' || rights === undefined) {
        players = Players.find({team_id: {$in: arrayOfTeams}}, {fields:{
            name: true,
            surname: true,
            age: true,
            team_id: true,
            country: true,
            height: true,
            weight: true,
            isonsale:true,
            wage: true,
            character: true
        }});
    } else if(rights === 'FULL') {
        players = Players.find({team_id: {$in: arrayOfTeams}});
    }
    return players;
};

export default Players;
