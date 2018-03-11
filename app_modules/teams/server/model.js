import { Mongo } from 'meteor/mongo';
import Chance from 'chance';
import arenaModel from './../../facilities/server/arena-model.js';
import medicalCenterModel from './../../facilities/server/medical-center-model.js';
import marketActivityModel from './../../markets/server/transfer-market/market-activity';

function model() {
    var api = {create, resetTeamAndDependecies, isBot, botsInList, botsInLeague, validate, _startingMoney, _randomLogo, _emptyTraining, _emptyTactics};

    /**
     * Reset team and all related
     * Delete news
     * Release existing players
     * Reset Arena
     * Reset Medical Center
     * @param  {[type]} teamID  [description]
     * @param  {[type]} name    [description]
     * @param  {[type]} country [description]
     * @return {[type]}         [description]
     */
    function resetTeamAndDependecies(teamID, name, country) {
        var season = GameInfo.findOne().season;
        var team = api.create(teamID, name, country, season);

        Teams.update({_id:teamID}, team);
        Events.remove({receiver_id: teamID});
        Players.update({team_id: teamID}, {$set:{team_id: null}}, {multi:true});
        arenaModel.reset(team.arena_name, teamID);
        medicalCenterModel.reset(teamID);
        marketActivityModel.reset(teamID);
    }

    function create(teamID, name, country, season) {
        var oldTeam = Teams.findOne({_id: teamID});
        var competitions = {};
        var team = {
            name: name,
            short_name: name + "'s team",
            arena_name: name + "'s arena",
            city: null,
            curmoney: api._startingMoney(),
            tempmoney: api._startingMoney(),
            country: country,
            logo: api._randomLogo(),
            shirt: 'black2',
            campinvest: 0,
            canPullYouth: true,
            training: api._emptyTraining(),
            tactics: api._emptyTactics()
        };

        if (oldTeam) {
            competitions = {
                natLeague: {
                    seasons: {
                        [season]: oldTeam.competitions.natLeague.seasons[season]
                    },
                    currentSeason: season
                },
                nationalCup: {
                    seasons: {
                    },
                    currentSeason: season
                }
            }

        } else {
            competitions = {
                natLeague: {
                    seasons: {
                    },
                    currentSeason: season
                },
                nationalCup: {
                    seasons: {
                    },
                    currentSeason: season
                }
            }
        }

        team.competitions = competitions;

        return team;
    }

    function validate() {

    }

    /**
     * Should check the average wealth at the moment of the creation. Right now it is hardcodded
     * @return {[type]} [description]
     */
    function _startingMoney() {
        var averageWealth = 25000000;
        var wealth = 0.2 * averageWealth;
        if (wealth<3000000) wealth = 3000000;
        return wealth;
    }

    function _randomLogo() {
        var logos = ['/resources/club-logo/basketball-bird.png', '/resources/club-logo/rhyno.png', '/resources/club-logo/shark.png',
                        '/resources/club-logo/wild-dog.png', '/resources/club-logo/wild-dog-2.png'];
        var chance = new Chance();
        return chance.pick(logos);
    }

    function _emptyTraining() {
        return {
            guards: {
              intensity: "Normal",
              type: "Handling",
              players: []
            },
            bigMen: {
              intensity: "Normal",
              type: "Handling",
              players: []
            }
        }
    }

    function _emptyTactics() {
        var tactics = {
            startingFive: {},
            subs: {},
            defensive: 'normal',
            offensive: 'normal'
        };

        var pos = ['PG', 'SG', 'SF', 'PF', 'C'];
        pos.forEach(function (p) {
            tactics.startingFive[p] = {player_id: null};
            tactics.subs[p] = {player_id: null};
        });

        return tactics;
    }

    /**
     * Checks if a team is a bot based on its team id
     * @param  {mongoID|string}  teamID Id of team to be checked
     * @return {Boolean}
     */
    function isBot(teamID) {
        if (typeof teamID === 'string') teamID = new Mongo.ObjectID(teamID);
        var userInfo = UserInfo.findOne({team_id: teamID});

        if (userInfo) return true;
        return false;
    }

    /**
     * Takes an array of team id strings, or team IDs and returns those that are bots
     * @param  {array} teamIDs Array of team ids
     * @return {array}         Array of team ids that are bots, as plain strings
     */
    function botsInList(teamIDs) {
        var ids = _.map(teamIDs, function(teamID){
            if (typeof teamID === 'string') return teamID;
            return teamID._str;
        });

        var mongoIDs = _.map(ids, function(id){
            return butils.general.objectID(id);
        });

        var active = UserInfo.find({team_id: {$in: mongoIDs}}, {fields: {team_id:1}}).fetch();
        var activeIDs = _.map(active, function(club){ return club.team_id._str;});

        var bots = _.difference(ids, activeIDs);

        return bots;
    }

    function botsInLeague(league, currentSeason) {
        var teamIDs = [];
        league.seasons[currSeason].teams.forEach(function (team) {
            teamIDs.push(team.team_id._str);
        });

        return api.botsInList(teamIDs);
    }

    return api;
}

export default model();