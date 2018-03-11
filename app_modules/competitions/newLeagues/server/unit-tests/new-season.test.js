import newSeason from './../new-season.js';
import { chai } from 'meteor/practicalmeteor:chai';
import {Mongo} from 'meteor/mongo';

describe('competitions:leagues:server:season-updates', function() {
    global.Teams = {find:function(){}};
    var ct = {};

    var sandbox;
    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        function lvl() {
            return {
                promoting: {
                    direct: [],
                    playoff: []
                },
                relegating: {
                    direct: [],
                    playoff: []
                },
                changed: []
            };
        }
        ct = {
            '1': lvl(),
            '2': lvl(),
            '3': lvl()
        };
        ct['1'].relegating.direct = ['a14', 'a13', 'a12'];
        ct['1'].relegating.playoff = ['a9', 'a11'];

        ct['2'].relegating.direct = ['14', '13', '12'];
        ct['2'].relegating.playoff = ['9', '10', '11'];
        ct['2'].promoting.direct = ['1'];
        ct['2'].promoting.playoff = ['2', '3'];

        ct['3'].promoting.direct = ['c1', 'c2', 'c3'];
        ct['3'].promoting.playoff = ['c4', 'c5', 'c6'];
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe('getTeams', function() {

        var leagueSeason = {
            teams: [{team_id: {_str: '1'}}, {team_id: {_str: '2'}},{team_id: {_str: '3'}},{team_id: {_str: '4'}},{team_id: {_str: '5'}},{team_id: {_str: '6'}},{team_id: {_str: '7'}},{team_id: {_str: '8'}},{team_id: {_str: '9'}},
            {team_id: {_str: '10'}},{team_id: {_str: '11'}},{team_id: {_str: '12'}},{team_id: {_str: '13'}}, {team_id: {_str: '14'}}]
        }

        var league = {
            seasons: {
                24: leagueSeason
            },
            level: 2
        };
        var playoffResults = {
            winners: ['a9', '3', 'c5', 'c4', '10'],
            losers: ['2', 'a11', '9', '11', 'c6'],
            pairs: [
                {loser: {_str: '2', name: '111'}, winner: {_str: 'a9', name:'222'} },
                {loser: {_str: 'a11', name: '111'}, winner: {_str: '3', name:'222'} },
                {loser: {_str: '9', name: '111'}, winner: {_str: 'c5', name:'222'} },
                {loser: {_str: '11', name: '111'}, winner: {_str: 'c4', name:'222'} },
                {loser: {_str: 'c6', name: '111'}, winner: {_str: '10', name:'222'} }
            ]
        };

        var botTeams = [];

        var maxLevel = 3,
        seasonNum = 24;

        it('Should return a season object containing 14 teams', function() {
            var teams = newSeason.getTeams(league, maxLevel, ct, playoffResults, botTeams, seasonNum);
            chai.assert.equal(teams.length, 14);
        });
        it('Should return a season object containing 14 teams when all of below teams are bots', function() {
            ct['3'].promoting.direct = ['c1', 'c2'];
            var teams = newSeason.getTeams(league, maxLevel, ct, playoffResults, botTeams, seasonNum);
            chai.assert.equal(teams.length, 14);
        });
        it('Should replace direct promoting team with first one relegating from above', function() {
            var teams = newSeason.getTeams(league, maxLevel, ct, playoffResults, botTeams, seasonNum);
            chai.assert.notInclude(teams, '1');
            chai.assert.include(teams, 'a14');
        });
        it('Should keep playoff promoting team if it lost the playoff', function() {
            var teams = newSeason.getTeams(league, maxLevel, ct, playoffResults, botTeams, seasonNum);
            chai.assert.notInclude(teams, 'a9');
            chai.assert.include(teams, '2');
        });
        it('Should replace playoff promoting team (with its pair) if it won the playoff', function() {
            var teams = newSeason.getTeams(league, maxLevel, ct, playoffResults, botTeams, seasonNum);
            chai.assert.notInclude(teams, '3');
            chai.assert.include(teams, 'a11');
        });
        it('Should replace direct relegating team with first one relegating from above AND remove the one from below', function() {
            var teams = newSeason.getTeams(league, maxLevel, ct, playoffResults, botTeams, seasonNum);
            chai.assert.notInclude(teams, '12', '13', '14');
            chai.assert.include(teams, 'c1', 'c2', 'c3');
            chai.assert.notInclude(ct['3'].relegating.direct, 'c1', 'c2', 'c3');
        });
        it('Should ensure the replacing team from above is not a bot, unless the level of the league is equal to maxLevel', function() {
            botTeams = ['a13'];
            ct['1'].relegating.direct = ['a13', 'a14'];
            var teams = newSeason.getTeams(league, maxLevel, ct, playoffResults, botTeams, seasonNum);
            chai.assert.notInclude(teams, 'a13');

            ct['1'].relegating.direct = ['a13', 'a14'];
            var teams = newSeason.getTeams(league, 2, ct, playoffResults, botTeams, seasonNum);
            chai.assert.include(teams, 'a13');
        });
        it('Should keep playoff relegating team if it won the playoff', function() {
            var teams = newSeason.getTeams(league, maxLevel, ct, playoffResults, botTeams, seasonNum);
            chai.assert.notInclude(teams, 'c6');
            chai.assert.include(teams, '10');
        });
        it('Should replace playoff relegating team (with its pair) if it won the playoff', function() {
            var teams = newSeason.getTeams(league, maxLevel, ct, playoffResults, botTeams, seasonNum);
            chai.assert.notInclude(teams, '11', '9');
            chai.assert.include(teams, 'c5', 'c4');
        });
        it('Should keep current team if it is not in any of the mentioned categories', function() {
            var teams = newSeason.getTeams(league, maxLevel, ct, playoffResults, botTeams, seasonNum);
            chai.assert.include(teams, '4', '5', '6', '7', '8', '9');
        });
    });
});