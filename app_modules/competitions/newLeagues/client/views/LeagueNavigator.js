import leagueModel from './../models/league-clientmodel.js';

Template.LeagueNavigator.onCreated(function(){
    var self = this;

    self.cdata = {
        country: new ReactiveVar(null),
        level: new ReactiveVar(null),
        levelsList: new ReactiveVar([]),
        series: new ReactiveVar(null),
        seriesList: new ReactiveVar(null),
        season: new ReactiveVar(null),
        seasonsList: new ReactiveVar([])
    }

    initSeasons(self);
    this.autorun(function(){
        if (self.data.league.get()) {
            let league = self.data.league.get();

            self.cdata.country.set(league.country);
            self.cdata.level.set(league.level);
            self.cdata.series.set(league.series);
            self.cdata.season.set(parseInt(self.data.displayedSeason, 10));

            getMinLevel(league.country, parseInt(self.data.displayedSeason, 10));
            getSeriesByLevel(league.level);
        }
    });
});

Template.LeagueNavigator.helpers({
    getCountry: getCountry,
    getLevel: getLevel,
    getSeries: getSeries,
    getSeason: getSeason,
    levels: renderLevels,
    series: renderSeries,
    countries: getCountries,
    seasons: renderSeasons,
    countries: renderCountries
});

Template.LeagueNavigator.events({
    'change .country-select': countrySelected,
    'change .season-select': seasonSelected,
    'change .level-select': levelSelected,
    'click .sel-go': goToLeague
});

function initSeasons(tpl) {
    Meteor.call('game-info:get', function (error, gi) {
        if (error) {
            sAlert.error('There was an issues retriving the seasons history');
        } else {
            tpl.cdata.seasonsList.set(gi.seasons);
        }
    });
}

function goToLeague(event) {
    event.preventDefault();
    var country = $('.country-select').val();
    var level = $('.level-select').val();
    var serie = $('.series-select').val();
    var season = $('.season-select').val();

    country = countrySlug(country);
    Router.go(`/national/leagues/${country}/${level}/${serie}/${season}`);
}

function getSeasons() {
    var tpl = new Template.instance();
    return tpl.cdata.seasonsList.get();
}

function getCountry() {
    var tpl = new Template.instance();
    return tpl.cdata.country.get();
}

function getLevel() {
    var tpl = new Template.instance();
    return tpl.cdata.level.get();
}

function getSeries() {
    var tpl = new Template.instance();
    var series = tpl.cdata.series.get();
    return series;
}

function getSeriesList() {
    var tpl = new Template.instance();
    return tpl.cdata.seriesList.get();
}

function renderCountries() {
    var countries = getCountries();
    var country = getCountry();

    if (!countries || !country) return '';
    var option = '';
    var html = ''
    countries.forEach(function (ct) {
        if (ct === country) {
            resizeCountryField(country);
            option = `<option class="country-option" selected="selected">${ct}</option>`;
        } else {
            option = `<option class="country-option">${ct}</option>`;
        }
        html += option;
    });

    return html;
}

function renderSeries() {
    var seriesList = getSeriesList();
    var series = getSeries();
    if (!seriesList || !series) return '';
    var option = '';
    var html = ''
    seriesList.forEach(function (serie) {
        if (serie === series) {
            option = `<option selected="selected">${serie}</option>`;
        } else {
            option = `<option>${serie}</option>`;
        }
        html += option;
    });

    return html;
}

function renderSeasons() {
    var seasons = getSeasons();
    var season = getSeason();
    if (!seasons || !season) return '';
    var option = '';
    var html = '';
    seasons.forEach(function (s) {
        if (s === season) {
            option = `<option selected="selected">${s}</option>`;
        } else {
            option = `<option>${s}</option>`;
        }
        html += option;
    });

    return html;
}

function getSeason() {
    var tpl = new Template.instance();
    return tpl.cdata.season.get();
}

function getCountries() {
    return butils.general.countries();
}

function getLevels() {
    var tpl = new Template.instance();
    return tpl.cdata.levelsList.get();
}

function renderLevels() {
    var levels = getLevels();
    var level = getLevel();
    if (!levels || !level) return '';
    var option = '';
    var html = ''
    levels.forEach(function (lvl) {
        if (lvl === level) {
            option = `<option class="level-option" selected="selected">${lvl}</option>`;
        } else {
            option = `<option class="level-option">${lvl}</option>`;
        }
        html += option;
    });

    return html;
}

function countrySelected(event) {
    var tpl = Template.instance();
    var selCountry = $(".country-select").val();
    var season = $(".season-select").val();
    resizeCountryField(selCountry);
    getMinLevel(selCountry, season);

}

function seasonSelected(event) {
    var selCountry = $(".country-select").val();
    var season = $(".season-select").val();
    getMinLevel(selCountry, season);
}

function levelSelected() {
    var level = $(".level-select").val();
    getSeriesByLevel(level);
}

function resizeCountryField(country) {
    var selCountry = country;
    $('.country-select').width(selCountry.length * 6 + 31);
}

function getMinLevel(country, season) {
    var tpl = Template.instance();
    leagueModel.getMinLevel(country, season, function(minLevel){
        let levels = [];
        for (var i = 1; i<=minLevel; i++) {
            levels.push(i);
        }

        if (tpl) tpl.cdata.levelsList.set(levels);
        setTimeout(function(){
            let level = $(".level-select").val();
            getSeriesByLevel(level, tpl);
        }, 10);
    });
}

function getSeriesByLevel(level, template) {
    var tpl = template || Template.instance();
    level = parseInt(level, 10);
    var series = Math.pow(3, level-1);
    var allSeries = [];

    for (var i=1; i<=series; i++) {
        allSeries.push(i);
    }

    tpl.cdata.seriesList.set(allSeries);
    return series;
}

function countrySlug(country) {
    country = country.toLowerCase();
    country = country.replace(/ /g, '-');
    return country;
}
