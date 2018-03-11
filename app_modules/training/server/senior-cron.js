import senior from './senior.js';
import news from './../../news/server/api.js';
import _ from 'underscore';
import Monitor from './../../monitoring/server/models/monitor.js';
import Teams from './../../../collections/Teams.js';
import teamsModel from './../../teams/server/models/team-datamodel';
import Players from './../../../collections/Players.js';
import { Meteor } from 'meteor/meteor';
import mongodb from 'mongodb';
/**
 * [seniorCron description]
 * @return {Object} The api of the seniorCron module
 */
function seniorCron () {
    var api = {run, clean, reRun, _trainTeam, _cleanPlayerLastTraining, _trainPlayer, _cleanTeamTraining, _validateTrainInput, _twoDecs, _validateSkill, _validateIntensity};

    /**
     * Cleans last training
     * Trains all active teams and after that
     * Removes the players from the training queue
     * @return {[type]} [description]
     */
    function run() {
        Events.remove({type: 'training-occured'});
        var monitor = new Monitor('training');
        var teams = teamsModel.getActive({training:1});
        monitor.runAndLogOnList(teams, runTraining, 'Training');

        function runTraining(team) {
            api._trainTeam(team);
            api._cleanTeamTraining(team);
            news.game.trainingOccured(team._id);
        }
    }

    /**
     * Reruns training for the teams that did not receive it
     */
    function reRun() {
        console.log('Rerun Training Started');
        var allTeams = teamsModel.getActive({training:1});
        var allTeamsStr = allTeams.map((team) => {return team._id._str; });
        var trainedEvents = Events.find({type: 'training-occured'}, { fields: { receiver_id: 1 }}).fetch();
        var trainedTeamsStr = trainedEvents.map((event) => {return event.receiver_id._str; });
        var untrainedTeamsStr = _.difference(allTeamsStr, trainedTeamsStr);
        var untrainedTeams = allTeams.filter((team) => {return _.contains(untrainedTeamsStr, team._id._str); });
        console.log('Teams to train: ', untrainedTeams.length);
        var monitor = new Monitor('training');
        monitor.runAndLogOnList(untrainedTeams, runTraining, 'Training');

        function runTraining(team) {
            api._trainTeam(team);
            news.game.trainingOccured(team._id);
        }
    }

    function clean() {
        var monitor = new Monitor('training');
        var teams = teamsModel.getActive({training:1});

        monitor.runAndLog(teams, api._cleanPlayerLastTraining);
    }

    /**
     * Resets last training for all players
     * Replace this with a batch update
     */
    function _cleanPlayerLastTraining(teams) {
        var teamIDs = teams.map(function(team) { return team._id; });
        var players = Players.find({team_id: {$in: teamIDs}}, { fields: { _id:1 }});
        var batch = Players.rawCollection().initializeUnorderedBulkOp();

        players.forEach(function (player, i) {
            let playerID = mongodb.ObjectId(player._id._str);
            batch.find({_id: playerID }).updateOne({$set: {
                lastTrainedSkill: null,
                lastTraining: 0
            }});

            if (i % 10000 === 0) console.log(i, 'players added to batch');
        });

        batch.execute(function(err, result){
            console.log('err', err);
            console.log('result', result.toJSON());
        });
    }

    /**
     * Train players from each training group from a team
     * @param  {Object} team [description]
     * @return {[type]}      [description]
     */
    function _trainTeam(team) {
        if (team && team.training) {
            var trainGroups = [team.training.guards, team.training.bigMen];

            var coach = Players.findOne({team_id: team._id, coach:1});

            _.each(trainGroups, function(tg){
                _.each(tg.players, function(playerid){
                    // player, skill, intensity, coach
                    if (!tg.type) {
                        // console.log('training type undefined', team, tg);
                    }
                    api._trainPlayer(playerid, tg.type, tg.intensity, coach);
                });
            });
        }
    }

    function _cleanTeamTraining(team) {
        Teams.update({_id: team._id}, {$set:{
            'training.guards.players': [],
            'training.bigMen.players': []
        }});
    }

    function _trainPlayer(player, skill, intensity, coach) {
        if (skill && intensity) {
            var input = api._validateTrainInput(skill, intensity);
            var playerObj = Players.findOne({_id: player});
            if (!playerObj) return;
            var trainingVal = senior.train(playerObj, input.skill, input.intensity, coach);
            var setter = {};
            var currentSkill = parseFloat(playerObj[input.skill]);
            setter[input.skill] = api._twoDecs(currentSkill + trainingVal);
            setter.lastTrainedSkill = input.skill;
            setter.lastTraining = trainingVal;

            Players.update({_id: player}, {$set: setter});
        }
    }

    function _validateTrainInput(skill, intensity) {
        return {
            skill: api._validateSkill(skill),
            intensity: api._validateIntensity(intensity)
        };
    }

    function _validateSkill(skill) {
        var formattedSkill = skill.toLowerCase();
        var skills = ['handling', 'quickness', 'passing', 'dribbling', 'rebounds', 'positioning', 'shooting', 'freethrow', 'defense'];
        if (formattedSkill === 'freethrows') formattedSkill = 'freethrow';

        if (!_.contains(skills, formattedSkill)){
            formattedSkill = 'handling';
        }

        return formattedSkill;
    }

    function _validateIntensity(intensity) {
        var formattedIntensity = intensity.toLowerCase();
        var intensities = ['leisure', 'normal', 'intense', 'immense'];

        if (!_.contains(intensities, formattedIntensity)){
            formattedIntensity = 'normal';
        }

        return formattedIntensity;
    }

    function _twoDecs(num) {
        return Math.round(num*100)/100;
    }

    return api;
}

export default seniorCron();
