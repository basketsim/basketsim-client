import { Blaze } from 'meteor/blaze'
import { Template } from 'meteor/templating'
import leagueModel from './../models/league-clientmodel.js';
import teamsModel from './../../../../teams/client/models/team-clientmodel';

Template.National.onCreated(function(){
    var self = this;
    this.cdata = {
        league: new ReactiveVar(null),
        team: new ReactiveVar(null),
        season: 0,
        urlData: new ReactiveVar(null)
    }
    this.autorun(function(){
        let params = Session.get('param-league-path');
        params = params.split('/');
        var l = params.length;
        var data = {
            country: params[l-4],
            level: params[l-3],
            series: params[l-2],
            season: params[l-1]
        };
        self.cdata.urlData.set(data);
        updateData(self, data);
    })
});

function updateData(tpl, data) {
    teamsModel.getOwn(function(team){
        tpl.cdata.team.set(team);
    });
    leagueModel.getLeagueAndInfo(data.country, data.level, data.series, data.season, function(league){
        tpl.cdata.league.set(league);
    });
    tpl.cdata.season = data.season;
}

Template.National.events({
    'click .show-league-stats': showLeagueStats
});

Template.National.helpers({
    getTeams: getTeams,
    getLeagueName: getLeagueName,
    getCupName: getCupName,
    previousMatches: previousMatches,
    nextMatches: nextMatches,
    getLeagueReactive: getLeagueReactive,
    displayedSeason: getDisplayedSeason,
    leaguePath: leaguePath,
    cupPath: cupPath
});

function leaguePath() {
    var tpl = Template.instance();
    var data = tpl.cdata.urlData.get();
    return `/national/leagues/${data.country}/${data.level}/${data.series}/${data.season}`;
}

function cupPath() {
    var tpl = Template.instance();
    var data = tpl.cdata.urlData.get();
    return `/national/cup/${data.country}/1/${data.season}`;
}

function getLeagueReactive() {
    var tpl = Template.instance();
    return tpl.cdata.league;
}

function getDisplayedSeason() {
    var tpl = Template.instance();
    return tpl.cdata.season;
}

function getLeague() {
    var tpl = Template.instance();
    return tpl.cdata.league.get();
}

function getSeason() {
    var tpl = Template.instance();
    return tpl.cdata.season;
}

function showLeagueStats(e) {
    e.preventDefault();
    var league = getLeague();
    var team = getTeam();
    var season = getSeason();
    if (!league) return;

    $('.league-standings').hide();

    if (!this.statsRendered) {
        let leagueName = league.country + ' ' + league.name;
        Blaze.renderWithData(Template.LeagueStats, {team:team, season:season, leagueName: leagueName, stats: league.stats, leagueID:league._id},
            $('.stats')[0]);
        this.statsRendered = true;
    } else {
        $('.stats').show();
    }
}

function getTeam() {
    var tpl = Template.instance();
    return tpl.cdata.team.get();
}

function getTeams() {
    var league = getLeague();
    var season = getSeason();
    if (!league || !season) return;

    var teams = league.seasons[season].teams;
    _.each(teams, function(team){
        team.pointsDifference = team.scored - team.against;
    });
    teams = _.sortBy(_.sortBy(_.sortBy(teams, 'scored'), 'pointsDifference'), 'win').reverse();
    _.each(teams, function(team, i){
        team.position = i+1;
    });
    return teams;
}

function getLeagueName() {
    var league = getLeague();
    if (!league) return '';

    return league.country + ' ' + league.name;
}

function getCupName() {
    var league = getLeague();
    if (!league) return '';

    return league.country + ' ' + 'Cup';
}

function nextMatches() {
    var league = getLeague();
    var season = getSeason();

    if (!league || !season) return [];
    return league.seasons[season].matches.next;
}

function previousMatches() {
    var league = getLeague();
    var season = getSeason();

    if (!league || !season) return [];
    return league.seasons[season].matches.previous;
}