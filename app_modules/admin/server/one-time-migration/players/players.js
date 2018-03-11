import players from './../../../../players/server/api.js';
import training from './../../../../training/server/api.js';

Meteor.methods({
    'multiple-growth': function() {
        if (this.userId !== 'wg2H3Bem7BrERkEsZ') return;
        players.grow.multiAllTeams();
    },
    'growth': function() {
        if (this.userId !== 'wg2H3Bem7BrERkEsZ') return;
        players.grow.allTeams();
    },
    floatWeight: function() {
        if (this.userId !== 'wg2H3Bem7BrERkEsZ') return;
        var length = Players.find({team_id: {$ne:null}}).count();
        Players.find({team_id: {$ne:null}}, {fields: {weight: 1}}).forEach(function (player, i) {
            Players.update({_id: player._id}, {
                $push:{'history.weight': {value: parseFloat(player.weight), timestamp: new Date().valueOf()}},
                $set:{weight: getWeight(player.weight)}});
            if ((i % 1000) === 0 || i+1 === length) console.log('floatify weight', i+1, '/', length);

        });
        console.log('floatWeight done');
    },
    addExperience: function() {
        if (this.userId !== 'wg2H3Bem7BrERkEsZ') return;
        addExperience();
    },
    recalculateYouthWr: function() {
        if (this.userId !== 'wg2H3Bem7BrERkEsZ') return;
        youthWr();
    }
});

function youthWr() {
    var getwr = training.youth.trainingWorkrate;
    var youthTraining = YouthTraining.find({workrate: Number.NaN}).fetch();
    console.log('start youth workrate update length', youthTraining.length);
    _.each(youthTraining, function(yt, i){
        let player = Players.findOne({_id: yt.player_id});
        let coach = _coachOfPlayer(player);
        let wr = training.youth.trainingWorkrate(player, coach, yt.skill, _validYouthTrainingInterval(yt.length));

        if (!wr) {
            console.log('wr for ', player._id, ' not defined');
        } else {
            YouthTraining.update({_id: yt._id}, {$set:{workrate: wr+12}});
        }

        console.log('youth workrate updated', i+1, '/', youthTraining.length);
    });
}

function _validYouthTrainingInterval(ytlength) {
    if (ytlength > 8) ytlength = 8;
    if (ytlength < 4) ytlength = 4;

    return ytlength;
}

function _coachOfPlayer(player) {
    var teamID = player.team_id;
    var coach = Players.findOne({team_id: teamID, coach:1});
    return coach;
}

function addExperience() {
    var teams = Teams.getActiveIDs();
    console.log('addExperience teams', teams.length);
    _.each(teams, function(team, i){
        let playedPerPlayer = {};
        let matches = Matches.find({'competition.collection':'Leagues', $or:[{'homeTeam.id': team._id},{'awayTeam.id': team._id}] }).fetch();

        updatePlayed(playedPerPlayer, matches, team._id);
        updateExperience(playedPerPlayer);
    });
    console.log('addExperience teams done');

}

function updatePlayed(playedPerPlayer, matches, teamID) {
    var pos = ['PG', 'SG', 'SF', 'PF', 'C'];
    _.each(matches, function(match){
        let team = whichTeam(match, teamID);
        _.each(pos, function(p){
            let playerID = '';
            if (match[team].startingFive[p].player_id) playerID = match[team].startingFive[p].player_id._str.toString();
            if (playerID) {
                if (playedPerPlayer[playerID]) {
                    playedPerPlayer[playerID]++;
                } else {
                    playedPerPlayer[playerID] = 1;
                }
            }
        });
    });
}


function updateExperience(playedPerPlayer) {
    _.each(playedPerPlayer, function(val, key){
        let playerID = new Mongo.ObjectID(key);
        let player = Players.findOne({_id: playerID}, {fields: {name:1, surname:1, experience:1}});
        if (!player) return;

        let games = val;
        let exp = games * 0.55;

        let newExp = parseFloat(player.experience) + exp;

        if (!isNaN(newExp)) {
            Players.update({_id: player._id}, {$set: {experience: newExp},
                $push:{'history.experience': {value: newExp, timestamp: new Date().valueOf()}}
            });
        } else {
            console.log('experience not updated')
        }
    });
}

function whichTeam(match, teamID) {
    var team = '';
    if (match.homeTeam.id._str === teamID._str) {
        team = 'homeTeam';
    } else if (match.awayTeam.id._str === teamID._str) {
        team = 'awayTeam';
    }
    return team;
}

function getWeight(weight) {
    var w = parseFloat(weight);
    return parseInt(w * 10)/10;
}