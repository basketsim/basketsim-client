import seasonUpdates from './../season-updates.js';
import leagueFactory from './factory.test.js';
import teamsModel from './../../../../teams/server/model.js';
import selfModel from './../models/model.js';
import { chai } from 'meteor/practicalmeteor:chai';
import { Chance } from 'meteor/risul:chance';



describe('competitions:leagues:server:season-updates', function () {
    var sandbox;
    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe('_relProLevel', function() {
        it('Should be empty when no leagues are filtered', function() {
            var league = leagueFactory.league();
            var levelObj = cleanLevelObj();
            var previousLevel = { relegating: {direct: [],playoff: [] } };
            sandbox.stub(teamsModel, 'botsInList').returns([]);
            levelObj = seasonUpdates._relProLevel(3, 23, [league], [], 4, previousLevel);

            chai.assert.equal(levelObj.relegating.direct.length, 0);
            chai.assert.equal(levelObj.relegating.playoff.length, 0);
        });
        it('Should have 3 direct and 3 playoff relegating teams, with the specified values, when no bots are contained', function() {
            var league = leagueFactory.league();
            var levelObj = cleanLevelObj();
            var previousLevel = { relegating: {direct: [],playoff: [] } };
            sandbox.stub(teamsModel, 'botsInList').returns([]);
            levelObj = seasonUpdates._relProLevel(1, 23, [league], [], 3, previousLevel);

            chai.assert.sameMembers(levelObj.relegating.direct, ['55cf113f1cc5f84ae63e4afe', '55cf11431cc5f84ae63e9cb3', '55cf113f1cc5f84ae63e4b1f']);
            chai.assert.sameMembers(levelObj.relegating.playoff, ['55cf113f1cc5f84ae63e4b58', '55cf113f1cc5f84ae63e4b04', '55cf11431cc5f84ae63e9c7b']);
        });
        it('Should have 5 direct and 2 playoff relegating teams, with the specified values, when there are 3 bots - one on first place, one in playoff and one on direct rel places', function() {
            var league = leagueFactory.league();
            var levelObj = cleanLevelObj();
            var previousLevel = { relegating: {direct: [],playoff: [] } };
            sandbox.stub(teamsModel, 'botsInList').returns([]);
            levelObj = seasonUpdates._relProLevel(1, 23, [league], ['55cf113f1cc5f84ae63e4b58', '55cf113f1cc5f84ae63e4afe', '55cf113f1cc5f84ae63e4ac4'], 3, previousLevel);

            chai.assert.sameMembers(levelObj.relegating.direct, ['55cf113f1cc5f84ae63e4ac4','55cf113f1cc5f84ae63e4b58', '55cf113f1cc5f84ae63e4afe', '55cf11431cc5f84ae63e9cb3', '55cf113f1cc5f84ae63e4b1f']);
            chai.assert.sameMembers(levelObj.relegating.playoff, ['55cf113f1cc5f84ae63e4b04', '55cf11431cc5f84ae63e9c7b']);
        });

        it('Should have 7 direct and 2 playoff relegating teams, with the specified values, when there are 3 bots and two from above', function() {
            var league = leagueFactory.league();
            var levelObj = cleanLevelObj();
            var previousLevel = { relegating: {direct: ['55cf113f1cc5f84ae63e4b20', '55cf113f1cc5f84ae63e4b21'],playoff: [] } };
            sandbox.stub(teamsModel, 'botsInList').returns(['55cf113f1cc5f84ae63e4b20', '55cf113f1cc5f84ae63e4b21']);
            levelObj = seasonUpdates._relProLevel(1, 23, [league], ['55cf113f1cc5f84ae63e4b58', '55cf113f1cc5f84ae63e4afe', '55cf113f1cc5f84ae63e4ac4'], 3, previousLevel);

            chai.assert.sameMembers(levelObj.relegating.direct, ['55cf113f1cc5f84ae63e4b20', '55cf113f1cc5f84ae63e4b21', '55cf113f1cc5f84ae63e4ac4','55cf113f1cc5f84ae63e4b58', '55cf113f1cc5f84ae63e4afe', '55cf11431cc5f84ae63e9cb3', '55cf113f1cc5f84ae63e4b1f']);
            chai.assert.sameMembers(levelObj.relegating.playoff, ['55cf113f1cc5f84ae63e4b04', '55cf11431cc5f84ae63e9c7b']);
        });
    });

    describe('getCountryStatus', function() {
        var sandbox;
        beforeEach(function () {
            sandbox = sinon.sandbox.create();
        });

        afterEach(function () {
            sandbox.restore();
        });
        var leagues = [
            leagueFactory.createLeague('Romania', 1, 24, leagueFactory.seasonFactory(...miniteams(14,1,1,true))),
            leagueFactory.createLeague('Romania', 2, 24, leagueFactory.seasonFactory(...miniteams(14,2,1,true))),
            leagueFactory.createLeague('Romania', 2, 24, leagueFactory.seasonFactory(...miniteams(14,2,2,true))),
            leagueFactory.createLeague('Romania', 2, 24, leagueFactory.seasonFactory(...miniteams(14,2,3,true))),
            leagueFactory.createLeague('Romania', 3, 24, leagueFactory.seasonFactory(...miniteams(14,3,1,true))),
            leagueFactory.createLeague('Romania', 3, 24, leagueFactory.seasonFactory(...miniteams(14,3,2,true))),
            leagueFactory.createLeague('Romania', 3, 24, leagueFactory.seasonFactory(...miniteams(14,3,3,true))),
            leagueFactory.createLeague('Romania', 3, 24, leagueFactory.seasonFactory(...miniteams(14,3,4,true))),
            leagueFactory.createLeague('Romania', 3, 24, leagueFactory.seasonFactory(...miniteams(14,3,5,true))),
            leagueFactory.createLeague('Romania', 3, 24, leagueFactory.seasonFactory(...miniteams(14,3,6,true))),
            leagueFactory.createLeague('Romania', 3, 24, leagueFactory.seasonFactory(...miniteams(14,3,7,true))),
            leagueFactory.createLeague('Romania', 3, 24, leagueFactory.seasonFactory(...miniteams(14,3,8,true))),
            leagueFactory.createLeague('Romania', 3, 24, leagueFactory.seasonFactory(...miniteams(14,3,9,true)))
        ];

        it('Team on first place in first league should be assigned champion', function() {
            sandbox.stub(selfModel, 'getBotTeams').returns([]);
            var countryStatus = seasonUpdates.getCountryStatus(leagues, 24);
            chai.assert.equal('bbbbbbbbbbbbbbbbbbb11d01', countryStatus['1'].champion);
        });
        it('First league should have 3 direct and 3 playoff relegating teams, when no bots are present', function() {
            sandbox.stub(selfModel, 'getBotTeams').returns([]);
            var countryStatus = seasonUpdates.getCountryStatus(leagues, 24);
            chai.assert.equal(3, countryStatus['1'].relegating.direct.length);
            chai.assert.equal(3, countryStatus['1'].relegating.playoff.length);
        });
        it('Second league should have 9 direct and 9 playoff relegating teams, when no bots are present', function() {
            sandbox.stub(selfModel, 'getBotTeams').returns([]);
            sandbox.stub(teamsModel, 'botsInList').returns([]);
            var countryStatus = seasonUpdates.getCountryStatus(leagues, 24);
            chai.assert.equal(9, countryStatus['2'].relegating.direct.length);
            chai.assert.equal(9, countryStatus['2'].relegating.playoff.length);
        });
        it('Third league should have 0 direct and 0 playoff relegating teams, when no bots are present', function() {
            sandbox.stub(selfModel, 'getBotTeams').returns([]);
            sandbox.stub(teamsModel, 'botsInList').returns([]);
            var countryStatus = seasonUpdates.getCountryStatus(leagues, 24);
            chai.assert.equal(0, countryStatus['3'].relegating.direct.length);
            chai.assert.equal(0, countryStatus['3'].relegating.playoff.length);
        });
        it('Third(last) league should have 0 direct and 0 playoff relegating teams, even when bots are present', function() {
            sandbox.stub(selfModel, 'getBotTeams').returns(['bbbbbbbbbbbbbbbbbbb33d05', 'bbbbbbbbbbbbbbbbbbb35d05']);
            sandbox.stub(teamsModel, 'botsInList').returns(['bbbbbbbbbbbbbbbbbbb23d05']);
            var countryStatus = seasonUpdates.getCountryStatus(leagues, 24);
            chai.assert.equal(0, countryStatus['3'].relegating.direct.length);
            chai.assert.equal(0, countryStatus['3'].relegating.playoff.length);
        });
        it('Third league should have 9 direct and 9 playoff promoting teams, when no bots are present', function() {
            sandbox.stub(selfModel, 'getBotTeams').returns([]);
            sandbox.stub(teamsModel, 'botsInList').returns([]);
            var countryStatus = seasonUpdates.getCountryStatus(leagues, 24);
            chai.assert.equal(9, countryStatus['3'].promoting.direct.length);
            chai.assert.equal(9, countryStatus['3'].promoting.playoff.length);
        });
        it('First league should have 5 specified direct and 3 specified playoff promoting teams, bot are present', function() {
            sandbox.stub(selfModel, 'getBotTeams').returns(['bbbbbbbbbbbbbbbbbbb11d05', 'bbbbbbbbbbbbbbbbbbb11d04']);
            sandbox.stub(teamsModel, 'botsInList').returns([]);
            var countryStatus = seasonUpdates.getCountryStatus(leagues, 24);
            chai.assert.sameMembers(['bbbbbbbbbbbbbbbbbbb11d04', 'bbbbbbbbbbbbbbbbbbb11d05', 'bbbbbbbbbbbbbbbbbbb11d14', 'bbbbbbbbbbbbbbbbbbb11d13', 'bbbbbbbbbbbbbbbbbbb11d12'], countryStatus['1'].relegating.direct);
            chai.assert.sameMembers(['bbbbbbbbbbbbbbbbbbb11d09', 'bbbbbbbbbbbbbbbbbbb11d11', 'bbbbbbbbbbbbbbbbbbb11d10'], countryStatus['1'].relegating.playoff);
        });
        it('First league should have 5 specified direct and 2 specified playoff promoting teams, when 1 bot is present on playoff place and 1 bot on normal', function() {
            sandbox.stub(selfModel, 'getBotTeams').returns(['bbbbbbbbbbbbbbbbbbb11d11', 'bbbbbbbbbbbbbbbbbbb11d04']);
            sandbox.stub(teamsModel, 'botsInList').returns([]);
            var countryStatus = seasonUpdates.getCountryStatus(leagues, 24);
            chai.assert.sameMembers(['bbbbbbbbbbbbbbbbbbb11d11', 'bbbbbbbbbbbbbbbbbbb11d04', 'bbbbbbbbbbbbbbbbbbb11d14', 'bbbbbbbbbbbbbbbbbbb11d13', 'bbbbbbbbbbbbbbbbbbb11d12'], countryStatus['1'].relegating.direct);
            chai.assert.sameMembers(['bbbbbbbbbbbbbbbbbbb11d09', 'bbbbbbbbbbbbbbbbbbb11d10'], countryStatus['1'].relegating.playoff);
        });
        it('Second league should have 5 specified direct (2+3) and 3 specified playoff promoting teams, bot are present', function() {
            sandbox.stub(selfModel, 'getBotTeams').returns(['bbbbbbbbbbbbbbbbbbb11d05', 'bbbbbbbbbbbbbbbbbbb11d04']);
            sandbox.stub(teamsModel, 'botsInList').returns([]);
            var countryStatus = seasonUpdates.getCountryStatus(leagues, 24);
            chai.assert.sameMembers(['bbbbbbbbbbbbbbbbbbb21d01', 'bbbbbbbbbbbbbbbbbbb22d01', 'bbbbbbbbbbbbbbbbbbb23d01', 'bbbbbbbbbbbbbbbbbbb23d02', 'bbbbbbbbbbbbbbbbbbb22d02'], countryStatus['2'].promoting.direct);
            chai.assert.sameMembers(['bbbbbbbbbbbbbbbbbbb21d02', 'bbbbbbbbbbbbbbbbbbb22d03', 'bbbbbbbbbbbbbbbbbbb23d03'], countryStatus['2'].promoting.playoff);
        });
        it('Second league should have 10 specified direct (7+3) and 3 specified playoff promoting teams, bot are present', function() {
            sandbox.stub(selfModel, 'getBotTeams').returns(['bbbbbbbbbbbbbbbbbbb22d04', 'bbbbbbbbbbbbbbbbbbb11d02', 'bbbbbbbbbbbbbbbbbbb11d03', 'bbbbbbbbbbbbbbbbbbb11d04', 'bbbbbbbbbbbbbbbbbbb11d05', 'bbbbbbbbbbbbbbbbbbb11d06', 'bbbbbbbbbbbbbbbbbbb11d07', 'bbbbbbbbbbbbbbbbbbb11d08']);
            sandbox.stub(teamsModel, 'botsInList').returns([]);
            var countryStatus = seasonUpdates.getCountryStatus(leagues, 24);
            chai.assert.sameMembers(['bbbbbbbbbbbbbbbbbbb21d01', 'bbbbbbbbbbbbbbbbbbb22d01', 'bbbbbbbbbbbbbbbbbbb23d01', 'bbbbbbbbbbbbbbbbbbb23d02',
                'bbbbbbbbbbbbbbbbbbb22d02', 'bbbbbbbbbbbbbbbbbbb21d02', 'bbbbbbbbbbbbbbbbbbb23d03', 'bbbbbbbbbbbbbbbbbbb22d03', 'bbbbbbbbbbbbbbbbbbb21d03', 'bbbbbbbbbbbbbbbbbbb23d04'], countryStatus['2'].promoting.direct);
            chai.assert.sameMembers(['bbbbbbbbbbbbbbbbbbb22d05', 'bbbbbbbbbbbbbbbbbbb21d04', 'bbbbbbbbbbbbbbbbbbb23d05'], countryStatus['2'].promoting.playoff);
        });
    });

    describe('_matchPromotingToRelegating', function() {
        var lvl = {
                promoting: {
                    direct: [],
                    playoff: []
                },
                relegating: {
                    direct: [],
                    playoff: []
                }
            };
        var ct = {
            '1': lvl,
            '2': lvl
        };

        it('3 active teams should relegate, but only 1 from below can promote -> should relegate 1 randomly', function() {
            ct['1'].relegating.direct = ['1', '2', '3'];
            ct['1'].promoting.direct = ['4'];
            seasonUpdates._matchPromotingToRelegating(ct, 2, []);
            chai.assert.equal(ct['1'].relegating.direct.length, 1);
        });
        it('3 active and 2 bots should relegate. 4 from below can promote -> should relegate 4 randomly. 1 random active saved and bots alywas relegated ', function() {
            ct['1'].relegating.direct = ['1', '2', '3', '4', '5'];
            ct['1'].promoting.direct = ['10', '11', '12', '13'];
            seasonUpdates._matchPromotingToRelegating(ct, 2, ['3', '5']);
            chai.assert.equal(ct['1'].relegating.direct.length, 4);
            chai.assert.include(ct['1'].relegating.direct, '3', '5');
        });
        it('1 active and 2 bots should relegate, but only 1 can promote -> choose a bot to rel. Save the active', function() {
            ct['1'].relegating.direct = ['1', '2', '3'];
            ct['1'].promoting.direct = ['10'];
            seasonUpdates._matchPromotingToRelegating(ct, 2, ['1', '3']);
            chai.assert.equal(ct['1'].relegating.direct.length, 1);
            chai.assert.notInclude(ct['1'].relegating.direct, '2');
        });
        it('5 bots should relegate, only 1 can promote -> choose  a bot to rel', function() {
            ct['1'].relegating.direct = ['1', '2', '3', '4', '5'];
            ct['1'].promoting.direct = ['10'];
            seasonUpdates._matchPromotingToRelegating(ct, 2, ['1', '2', '3', '4', '5']);
            chai.assert.equal(ct['1'].relegating.direct.length, 1);
            chai.assert.include(['1', '2', '3', '4', '5'], ...ct['1'].relegating.direct);
        });
        it('3 active should play playoff, but only 1 from below is available to play it -> choose randomly 1 that play it.', function() {
            ct['1'].relegating.playoff = ['1', '2', '3'];
            ct['1'].promoting.playoff = ['4'];
            seasonUpdates._matchPromotingToRelegating(ct, 2, []);
            chai.assert.equal(ct['1'].relegating.playoff.length, 1);
        });
    });
});
/**
 * Quick mini teams generator
 * @param  {number} numTeams Number of teams returned
 * @param  {number} level    League level of team
 * @return {[type]}          [description]
 */
function miniteams(numTeams, level, series, shuffle) {
    var teams = [];
    var startingVictories = 26;
    var chance = new Chance();
    for (var i=1; i<=numTeams; i++) {
        let id = 0;
        i<10? id = '' + level + series + 'd' + '0' + i : id = '' + level + series + 'd' + i;
        teams.push([startingVictories+1-i, level,0, id]);
    }

    if (shuffle) {
        teams = chance.shuffle(teams);
    }
    return teams;
}

function cleanLevelObj() {
    return {
        champion: '',
        promoting: {
            direct: [],
            playoff: []
        },
        relegating: {
            direct: [],
            playoff: []
        }
    };
}