var matchesModule = './../../../matches/server/api.js'
function matchUtils() {
    var api = {groupMatch, playoffMatch};

    function groupMatch(homeId, awayId, compId, round, groupNumber, calendarDate) {
        var competition = {
            collection: 'PheonixTrophy',
            id: compId,
            groupNumber: groupNumber,
            round: round,
            type: 'friendly',
            stage: 'group'
        };
        matchesModule.setMatch(homeId, awayId, 'home', calendarDate, null, competition);
    };
    function playoffMatch(homeId, awayId, compId, location, round, calendarDate) {
        var competition = {
            collection: 'PheonixTrophy',
            id: compId,
            round: round,
            type: 'friendly',
            stage: 'playoff'
        };
        matchesModule.setMatch(homeId, awayId, location, calendarDate, null, competition);
    };

    return api;
}