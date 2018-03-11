import teamsModel from './../../app_modules/teams/client/models/team-clientmodel.js';

Router.route('national', {
    action: function() {
        teamsModel.getOwn(function(team){
            var season = Session.get('gameInfo').season;
            var country = team.country.toLowerCase().replace(/ /g, '-');
            var level = team.competitions.natLeague.seasons[season].level;
            var series = team.competitions.natLeague.seasons[season].series;
            Router.go('/national/leagues/'+country+'/'+level+'/'+series+'/'+season, {replaceState:true});
        });
    }
});
Router.route('national/leagues', {
    action: function() {
        teamsModel.getOwn(function(team){
            var season = Session.get('gameInfo').season;
            var country = team.country.toLowerCase().replace(/ /g, '-');
            var level = team.competitions.natLeague.seasons[season].level;
            var series = team.competitions.natLeague.seasons[season].series;
            Router.go('/national/leagues/'+country+'/'+level+'/'+series+'/'+season, {replaceState:true});
        });
    }
});