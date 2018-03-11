Meteor.methods({
    testInsertTeamUpdate: testInsertTeamUpdate
});

function testInsertTeamUpdate() {
    if (this.userId !== 'wg2H3Bem7BrERkEsZ') return;
    var leagueId = new Mongo.ObjectID('55cf04f11cc5f84ae61f0996');
    var currentSeason = 23;
    var team = {
        _id: new Mongo.ObjectID('55cf113f1cc5f84ae63e4b00'),
        team_id: new Mongo.ObjectID('55cf113f1cc5f84ae63e4b00'),
        name: 'All Stars Ploiesti',
        season: 23,
        position: 1,
        played: 1,
        win: 1,
        lose: 0,
        scored: 84,
        against: 67,
        difference: 0,
        lastpos: 1
    };

    var resetTeam = {
        _id: new Mongo.ObjectID('55cf113f1cc5f84ae63e4b00'),
        team_id: new Mongo.ObjectID('55cf113f1cc5f84ae63e4b00'),
        name: 'All Stars Ploiesti',
        season: 23,
        position: 1,
        played: 0,
        win: 0,
        lose: 0,
        scored: 0,
        against: 0,
        difference: 0,
        lastpos: 1
    };

    insertTeamUpdate(leagueId, currentSeason, resetTeam);
}

function insertTeamUpdate(leagueId, currentSeason, team) {
    var update = {
        _id: leagueId
    };
    var setter = {};

    update['seasons.'+currentSeason+'.teams._id'] = team._id;
    setter['seasons.'+currentSeason+'.teams.$'] = team;

    Leagues.update(update, {
        $set:setter
    });
}