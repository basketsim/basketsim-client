var self = this;
/* FOR ALL METHODS, CHECK IF USER HAS THE CORRECT RIGHTS*/
Meteor.methods({
	'clearCollection': function (collectionName) {
		var collection = self[collectionName];
		collection.remove({});
	}
});

Meteor.methods({
	'updateid': function (collectionName) {
		var collection = self[collectionName];
		var userInfo = collection.find().fetch();

		for(var i=0; i< userInfo.length; i++) {
			collection.update({_id: userInfo[i]._id}, {$set: {_id: userInfo[i]._id._str} });
		}
	}
});

Meteor.methods({
	createLeague: function(inpLeague, teams) {
		var league = {
			name: inpLeague.name,
			country: inpLeague.country,
			region: inpLeague.region, //for merged countries
			level: inpLeague.level, //1, 2, 3, etc
			series: inpLeague.series, //1,2,3,4,5,6,7 - level+series = 2.3; 3.5 etc
			teams: []
		};

		for (var i=0; i<teams.length; i++) {
			league.teams.push({
				team_id: teams[i],
				gamesPlayed: 0,
				wins: 0,
				losses: 0,
				scoredPoints: 0,
				againstPoints: 0
			});
		}

		NatLeagues.insert(league);
	},
	resetLeague: function(id) {
		var league = NatLeagues.findOne({_id: id});
		_.each(league.teams, function(team){
			for (var key in team) {
				if (key !== 'team_id') {
					team[key] = 0;
				}
			}
	        NatLeagues.update({_id: id, 'teams.team_id': team.team_id}, {
	            $set:{'teams.$' : team}
	        });
		});
        NatLeagues.update({_id: id}, {
            $set:{nextRound : 1}
        });
	}
});

Meteor.methods({
	updateTraining: function(info) {
		var team = Teams.getByUserid(this.userId);
		if (info.category === 'Focus') info.category = 'type';
		if (info.category === 'Intensity') info.category = 'intensity';

		if (info.group === 'guards') {
			if (info.category === 'type') {
				Teams.update({_id:team._id}, {$set:{'training.guards.type': info.item}});
			} else if (info.category === 'intensity') {
				Teams.update({_id:team._id}, {$set:{'training.guards.intensity': info.item}});
			}
		} else {
			if (info.category === 'type') {
				Teams.update({_id:team._id}, {$set:{'training.bigMen.type': info.item}});
			} else if (info.category === 'intensity') {
				Teams.update({_id:team._id}, {$set:{'training.bigMen.intensity': info.item}});
			}
		}
	}
});