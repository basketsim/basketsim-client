class LeagueClientModel {
    getLeagueAndInfo(country, level, series, season, callback) {
        country = formatCountryName(country);
        Meteor.call('competitions:leagues:getLeagueAndInfo', country, level, series, season, function (error, league) {
            if (error) {
                sAlert.error('There was an issue retrieving this league. Please try again or file a bug report');
            } else {
                callback(league);
            }
        });
    }
    getMinLevel(country, season, callback) {
        Meteor.call('competitions:newLeagues:getMinLevel', country, season, function (error, level) {
            if (error) {
                sAlert.error('There was an issue retrieving the levels for ' + country);
            } else {
                callback(level);
            }
        });
    }
}

function formatCountryName(country) {
        country = removeSlash(country);
        country = toTitleCase(country);
        if (country === 'Usa') country = 'USA';
        if (country === 'Fyr Macedonia') country = 'FYR Macedonia';

        return country;
}

function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

function removeSlash(str) {
    return str.split('-').join(' ');
}

export default new LeagueClientModel();