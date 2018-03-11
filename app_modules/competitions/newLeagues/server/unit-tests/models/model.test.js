import model from '../../models/model.js';
import { chai } from 'meteor/practicalmeteor:chai';
import { sinon } from 'meteor/practicalmeteor:sinon';
import leagueFactory from './../factory.test.js';
import butils from './../../../../../utils/common/api.js';
import UserInfo from './../../../../../../collections/UserInfo.js';

describe('competitions:leagues:server:models:model', function () {
    var sandbox;
    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe('isLeagueActive', function() {
      it('Returns false when season object does not exist', function () {
        chai.assert.notOk(model.isLeagueActive(testData.inactiveNoSeason(), 24));
      });

      it('Returns false when season object has no teams', function () {
        chai.assert.notOk(model.isLeagueActive(testData.inactiveNoTeams(), 24));
      });

      it('Returns true when season object exists and has teams', function() {
        var league = testData.active();
        chai.assert.ok(model.isLeagueActive(league, 24));
      });
    });

    describe('getMinLeagueLevel', function() {
      it('Min league should be 3', function () {
        var leagues = [testData.inactiveNoSeason(4), testData.inactiveNoSeason(4), testData.active(3)];
        chai.assert.equal(model.getMinLeagueLevel(leagues, 24), 3);
      });

      it('Min league should be 2', function () {
        var leagues = [testData.active(1), testData.active(2), testData.active(2)];
        chai.assert.equal(model.getMinLeagueLevel(leagues, 24), 2);
      });
    });

    describe('getBotTeams', function() {
      it('Bot length should be 2 when there are 5 teams and 3 active', function () {
        var leagues = [{
            level: 1,
            seasons: {
                24: {
                    teams: [{team_id: {_str: "1"}}, {team_id: {_str: "2"}}, {team_id: {_str: "3"}}, {team_id: {_str: "4"}}, {team_id: {_str: "5"}}]
                }
            }
        }];
        var activeUsers = [{team_id: {_str: "3"}}, {team_id: {_str: "4"}}, {team_id: {_str: "5"}}];
        sandbox.stub(UserInfo, 'find', function(){
            return {fetch: function(){return activeUsers}}
        });
        chai.assert.equal(model.getBotTeams(leagues, 3, 24).length, 2);
      });

      it('Bot length should be 2 when there are 5 teams and 3 active and 1 league lower than min level', function () {
        var leagues = [{
            level: 1,
            seasons: {
                24: {
                    teams: [{team_id: {_str: "1"}}, {team_id: {_str: "2"}}, {team_id: {_str: "3"}}, {team_id: {_str: "4"}}, {team_id: {_str: "5"}}]
                }
            }
        }, {
            level: 4,
            seasons: {
                24: {
                    teams: [{team_id: {_str: "1"}}, {team_id: {_str: "2"}}, {team_id: {_str: "3"}}, {team_id: {_str: "4"}}, {team_id: {_str: "5"}}]
                }
            }
        }];
        var activeUsers = [{team_id: {_str: "3"}}, {team_id: {_str: "4"}}, {team_id: {_str: "5"}}];
        sandbox.stub(UserInfo, 'find', function(){
            return {fetch: function(){return activeUsers}}
        });
        chai.assert.equal(model.getBotTeams(leagues, 3, 24).length, 2);
      });

      it('Bot length should be 6 when there are 10 teams and 4 active in 2 leagues with level higher than min', function () {
        var leagues = [{
            level: 1,
            seasons: {
                24: {
                    teams: [{team_id: {_str: "1"}}, {team_id: {_str: "2"}}, {team_id: {_str: "3"}}, {team_id: {_str: "4"}}, {team_id: {_str: "5"}}]
                }
            }
        }, {
            level: 2,
            seasons: {
                24: {
                    teams: [{team_id: {_str: "6"}}, {team_id: {_str: "7"}}, {team_id: {_str: "8"}}, {team_id: {_str: "9"}}, {team_id: {_str: "10"}}]
                }
            }
        }];
        var activeUsers = [{team_id: {_str: "3"}}, {team_id: {_str: "4"}}, {team_id: {_str: "5"}}, {team_id: {_str: "10"}}];
        sandbox.stub(UserInfo, 'find', function(){
            return {fetch: function(){return activeUsers}}
        });
        chai.assert.equal(model.getBotTeams(leagues, 3, 24).length, 6);
      });
    });

    describe('sortTeamsByStanding', function() {
      it('Teams should be ordered by number of points, score difference and scored points', function () {
        var season = leagueFactory.season();
        var teams = _.map(season.teams, function (team) { return team.team_id._str; });
        var orderedSeason = leagueFactory.orderedSeason();
        var orderedTeams = _.map(orderedSeason.teams, function (team) { return team.team_id._str; });
        var orderedModelTeams = _.map(model.sortTeamsByStanding(season), function(team) {return team.team_id._str;});

        chai.assert.deepEqual(orderedModelTeams, orderedTeams);
      });
    });

    describe('bestOnPlace', function() {
      it('Should sort teams from same place from different seasons', function () {
        var seasons = [
          leagueFactory.seasonFactory([10,0,0,'001'], [5,0,0,'002'], [4,0,0,'003']),
          leagueFactory.seasonFactory([10,0,0,'011'], [8,20,5,'012'], [4,0,0,'013']),
          leagueFactory.seasonFactory([10,0,0,'021'], [8,20,0,'022'], [4,0,0,'023'])
        ];

        var sorted = [
          leagueFactory.seasonFactory([10,0,0,'011'], [8,20,5,'012'], [4,0,0,'013']),
          leagueFactory.seasonFactory([10,0,0,'021'], [8,20,0,'022'], [4,0,0,'023']),
          leagueFactory.seasonFactory([10,0,0,'001'], [5,0,0,'002'], [4,0,0,'003'])
        ];

        var sortedTeams = sorted.map(function(season){
          return season.teams[1];
        });

        var teams = model.bestOnPlace(3, 2, seasons);
        chai.assert.deepEqual(teams, sortedTeams);
      });
    });

    describe('bestOnPlaceExcluding', function() {
      it('Should sort 3 teams and exclude 2 bots - returning 1 team', function () {
        var seasons = [
          leagueFactory.seasonFactory([10,0,0,'001'], [5,0,0,'002'], [4,0,0,'003']),
          leagueFactory.seasonFactory([10,0,0,'011'], [8,20,5,'012'], [4,0,0,'013']),
          leagueFactory.seasonFactory([10,0,0,'021'], [8,20,0,'022'], [4,0,0,'023'])
        ];

        var sorted = [
          leagueFactory.seasonFactory([10,0,0,'001'], [5,0,0,'002'], [4,0,0,'003'])
        ];

        var sortedTeams = sorted.map(function(season){
          return season.teams[1];
        });

        var excluded = ['bbbbbbbbbbbbbbbbbbbbb022', 'bbbbbbbbbbbbbbbbbbbbb012'];

        var teams = model.bestOnPlaceExcluding(3, 2, seasons, excluded);
        chai.assert.deepEqual(teams, sortedTeams);
      });
      it('Should sort 3 teams and exclude 3 bots - returning 0 teams', function () {
        var seasons = [
          leagueFactory.seasonFactory([10,0,0,'001'], [5,0,0,'002'], [4,0,0,'003']),
          leagueFactory.seasonFactory([10,0,0,'011'], [8,20,5,'012'], [4,0,0,'013']),
          leagueFactory.seasonFactory([10,0,0,'021'], [8,20,0,'022'], [4,0,0,'023'])
        ];

        var sorted = [];

        var sortedTeams = sorted.map(function(season){
          return season.teams[1];
        });

        var excluded = ['bbbbbbbbbbbbbbbbbbbbb022', 'bbbbbbbbbbbbbbbbbbbbb012', 'bbbbbbbbbbbbbbbbbbbbb002'];

        var teams = model.bestOnPlaceExcluding(3, 2, seasons, excluded);
        chai.assert.deepEqual(teams, sortedTeams);
      });
    });



});

var testData = {
    inactiveNoSeason,
    inactiveNoTeams,
    active
};

function inactiveNoSeason(level) {
    return {
      level: level || 4,
      "seasons": {
        "22": {
          "teams": []
        },
        "23": {
          "teams": []
        }
      },
    }
}

function inactiveNoTeams(level) {
    return {
      level: level || 4,
      "seasons": {
        "22": {
          "teams": []
        },
        "23": {
          "teams": []
        },
        "24": {
          "teams": []
        }
      }
    }
}

function active(level) {
    return {
      level: level || 2,
      "seasons": {
        "22": {
          "teams": []
        },
        "23": {
          "teams": []
        },
        "24": {
          "teams": butils.general.list(14, leagueFactory.leagueTeam)
        }
      }
    }
}

