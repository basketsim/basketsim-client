import teamModel from './../model.js';
import arenaModel from './../../../facilities/server/arena-model.js';
import medicalCenterModel from './../../../facilities/server/medical-center-model.js';
import Chance from 'chance';

function createBotTeam() {
    var api = {create, insert};

    function create(name, competitions, country) {
        var team = {
            createdAt: new Date(),
            name: name,
            short_name: name,
            arena_name: name + 's arena',
            city: null,
            curmoney: teamModel._startingMoney(),
            tempmoney: teamModel._startingMoney(),
            country: country,
            logo: teamModel._randomLogo(),
            shirt: 'black2',
            campinvest: 0,
            canPullYouth: true,
            competitions: competitions,
            training: teamModel._emptyTraining(),
            tactics: teamModel._emptyTactics(),
            stats: {}
        };
        return team;
    }

    /** The returned team should, in theory, contain the _id as teamID is returned immediatly*/
    function insert(name, competitions, country, callback) {
        var team = api.create(name, competitions, country);
        Teams.insert(team, function(err, teamID){
            insertFacilities(team, teamID);
            assignPlayers(team, teamID);
            team._id = teamID;
            callback(team);
        });
    }

    /**
     * insert arena
     * insert medical center
     */
    function insertFacilities(team, teamID) {
        arenaModel.insert(team.arena_name, teamID);
        medicalCenterModel.insert(teamID);
    }

    /**
     * assign 12 random players from the senior players without team
     * @param  {[type]} team [description]
     * @return {[type]}      [description]
     */
    function assignPlayers(team, teamID) {
        var players = Players.find({coach:0, team_id: null}, {limit:5000, fields: {_id:1, team_id:1}}).fetch();
        var chance = new Chance();
        if (players.length < 12) return;

        var selectedPlayers = chance.pick(players, 12);

        selectedPlayers.forEach(function (player) {
            Players.update({_id: player._id}, {
                $set:{
                    team_id:teamID
                },
                $push: {
                    ['history.team_id']: {
                        value: player.team_id,
                        changedAt: new Date()
                    }
                }
            }, function(){});
        });
    }

    return api;
}

export default createBotTeam();