import utils from './utils.js';

function admin () {
    var api = {allowNewPullsStarted, allowNewPullsEnded, simulateMatchesEnded,
        finishMatchesEnded, trainingStarted, trainingEnded, archiveMatchesStarted, archiveMatchesEnded};
    var receiver_id = 'wg2H3Bem7BrERkEsZ';

    function allowNewPullsStarted() {
        var type = 'allow-new-pulls-started';
        var event = utils.newEvent('admin', receiver_id);
        event.type = type;
        AdminEvents.insert(event);
    }

    function allowNewPullsEnded() {
        var type = 'allow-new-pulls-started';
        var event = utils.newEvent('admin', receiver_id);
        event.type = type;
        AdminEvents.insert(event);
    }

    function simulateMatchesEnded(matchesTotal, simulated, countries) {
        if (!(matchesTotal > 0)) return;
        var type = 'simulate-matches-ended';
        var event = utils.newEvent('admin', receiver_id);
        event.info = {
            matchesTotal: matchesTotal,
            simulated: simulated,
            countries: countries
        };
        event.type = type;
        AdminEvents.insert(event);
    }

    function finishMatchesEnded(matchesNum, simulated, countries) {
        if (!(simulated > 0)) return;
        var type = 'finish-matches-ended';
        var event = utils.newEvent('admin', receiver_id);
        event.info = {
            matchesTotal: matchesNum,
            simulated: simulated,
            countries: countries
        };
        event.type = type;
        AdminEvents.insert(event);
    }

    function archiveMatchesStarted() {
        var type = 'archive-matches-started';
        var event = utils.newEvent('admin', receiver_id);
        event.type = type;

        AdminEvents.insert(event);
    }

    function archiveMatchesEnded(matchesNum, countries) {
        var type = 'archive-matches-ended';
        var event = utils.newEvent('admin', receiver_id);

        event.type = type;
        AdminEvents.insert(event);
    }

    function trainingStarted() {
        var type = 'archive-matches-started';
        var event = utils.newEvent('admin', receiver_id);
        event.type = type;

        AdminEvents.insert(event);
    }

    function trainingEnded(matchesNum, countries) {
        var type = 'archive-matches-ended';
        var event = utils.newEvent('admin', receiver_id);

        event.type = type;
        AdminEvents.insert(event);
    }

    return api;
}

export default admin();