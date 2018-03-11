Meteor.methods({
    populateLeagues: function (season) {
        // var leagues = Leagues.find({"_id": {$in: [new Mongo.ObjectID("55cf04f11cc5f84ae61f096a"), new Mongo.ObjectID("55cf04f11cc5f84ae61f096c")]}}).fetch();
        var leagues = Leagues.find().fetch();
        var ids = getIds(leagues);

        // initStructure(leagues, ids);
        // createSeries(leagues, ids);
        // fillTeams(leagues, ids, season);
        // setCurrentSeason(ids);
        // teamToLeague(leagues, season);
    },
    updateSeries: function() {
        var leagues = Leagues.find().fetch();
        _.each(leagues, function(league){
            Leagues.update({_id: league._id}, {$set:{series: parseInt(league.series)}});
        });
    }
});

function getIds(leagues) {
    var ids = [];
    _.each(leagues, function(lg){
        ids.push(lg._id);
    });
    console.log('ids', ids);
    return ids;
}

function initStructure(leagues, ids) {
    console.log('INIT STRUCTURE');
    Leagues.update({_id: {$in: ids}}, {$set:{
        seasons: {
            22: {
                teams: []
            },
            23: {
                teams: []
            }
        },
        series: ''
    }}, {multi:true});
}

function setCurrentSeason(ids) {
    console.log('SET CURRENT STRUCTURE');
    Leagues.update({_id: {$in: ids}}, {$set:{
        currentSeason: 22
    }}, {multi:true});
}

function createSeries(leagues) {
    console.log('CREATE SERIES');
    var level;
    var series;
    _.each(leagues, function(lg, i){
        console.log('create searies', i+1,'/',leagues.length);
        if (lg.level === 1) {
            series = 1;
        } else {
            series = lg.name.split('.')[1];
        }

        Leagues.update({_id: lg._id}, {$set:{series: series}});
    });
}

function fillTeams(leagues, ids, season) {
    console.log('FILL TEAMS');
    var competitions = [];
    var setter = {};
    _.each(leagues, function(lg, i){
        console.log('fill teams', i+1,'/',leagues.length);
        competitions = Competitions.find({league_id: lg._id, season: season}).fetch();
        setter['seasons.'+season+'.teams'] = competitions;
        Leagues.update({_id: lg._id}, {$set: setter});
    });
}

function teamToLeague(leagues, season) {
    console.log('TEAM TO LEAGUE');
    var setter = {};
    _.each(leagues, function(lg, i){
        console.log('team to league', i+1,'/',leagues.length);
        _.each(lg.seasons[22].teams, function(team) {
            setter['competitions.natLeague.seasons.'+season] = {
                _id: lg._id,
                name: lg.name,
                level: lg.level,
                series: lg.series
            };
            setter['competitions.natLeague.currentSeason'] = lg.currentSeason;
            Teams.update({_id: team.team_id}, {$set: setter});
        });
    })
}

