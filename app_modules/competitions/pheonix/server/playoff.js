import dateUtils from './date-utils';
import matchUtils from './match-utils';
/**
 * Based on the number of teams you need in the playoff, and the existing groups, decide which teams will get promoted
 * @param  {[type]} groups         [description]
 * @param  {[type]} noTeamsPlayoff [description]
 * @return {Array} array of promoted teams
 */
function playoff() {
    var api = {create, playoffNextMatches};

    var chance = new Chance();

    function create(noTeamsPlayoff) {
        var competition = PheonixTrophy.find().fetch()[0];
        var groups = competition.groups; //returns 1, but this should not be final

        var numOfGroups = Object.keys(groups).length;
        var promoted = [];
        var bestOfRemaining = [];
        var promotingPlaces = parseInt(noTeamsPlayoff/numOfGroups);
        var remainingFreeSpots = noTeamsPlayoff % numOfGroups;

        //push qualifying places to playoff and select remaining teams from the next place
        for (var groupKey in groups) {
            groups[groupKey].teams = _.sortBy(groups[groupKey].teams, 'wins', 'pointsDifference').reverse();
            for (var i=0; i<promotingPlaces; i++) {
                promoted.push(groups[groupKey].teams[i]);
            }
            bestOfRemaining.push(groups[groupKey].teams[i]);
        }

        bestOfRemaining = _.sortBy(bestOfRemaining, 'wins', 'pointsDifference').reverse();
        for (var j=0; j<remainingFreeSpots; j++) {
            promoted.push(bestOfRemaining[j]);
        }

        var setter = playoffSetter(promoted, competition);

        insertPlayoff(setter);
        playoffNextMatches(setter.playoff.round1.teams, competition, setter.playoff.round1.date);
    }
    /**
     * Create the playoff object and insert the qualified teams into the first round
     */
    function insertPlayoff(setter) {
        PheonixTrophy.update({edition:1}, {$set: setter});
    }

    function playoffSetter(promoted, competition) {
        var playoff = makePlayoff(promoted);
        var setter = makePlayoffSetter(playoff, competition.state);

        return setter;
    }

    function makePlayoff(promoted) {
        var playoff = {};
        playoff = setRounds(promoted);
        playoff = setFirstRound(promoted, playoff);

        return playoff;
    }

    function makePlayoffSetter(playoff, competitionState) {
        var updateObj = {
            playoff: playoff,
            state: competitionState
        };

        updateObj.state.stage = 'playoff';
        updateObj.state.nextRound = 1;

        return updateObj;
    }

    function setRounds(promoted) {
        var playoff = {};
        var dates = [];
        playoff.rounds = Math.log(promoted.length)/Math.LN2;
        dates = roundDates(moment().format('YYYY-MM-DD'), playoff.rounds); //starts today, not sure if best for general use

        for (var i=1; i<=playoff.rounds; i++) {
            playoff['round'+i] = {};
            playoff['round'+i].teams = [];
            playoff['round'+i].date = dates[i-1];
        }
        return playoff;
    }

    function setFirstRound(promoted, playoff) {
        _.each(promoted, function(team) {
            playoff.round1.teams.push(team._id);
        });

        playoff.round1.teams = chance.shuffle(playoff.round1.teams);

        return playoff;
    }

    function playoffNextMatches(teams, competition, calendarDate) {
        for (var i=0; i< teams.length; i+=2) {
            matchUtils.playoffMatch(teams[i], teams[i+1], competition._id, 'home', competition.state.nextRound, calendarDate);
            console.log('playoffMatch', i/2+1, '/', teams.length/2, 'set');
        }
    }
    /**
     * Go through all rounds for this competition and return an array of dates, matching the rounds
     * @param  {[type]} competitionRules [description]
     * @param  {[type]} startDate        [description]
     * @param  {[type]} stage        [    groupStage/playoffStage
     * @param  {[type]} rounds           [description]
     * @return {[type]}                  [description]
     */
    function roundDates(startDate, noOfRounds) {
        var date = '';
        var dates = [];
        // ['Tuesday', 'Thursday', 'Saturday'] - relative to Sundays
        var playingDates= [2, 4, 6];
        var weekOffset = 0;
        var dayCounter = 0;

        for (var i=0; i< noOfRounds; i++) {
            date = moment(startDate).add(playingDates[dayCounter], 'days').add(weekOffset, 'weeks');
            date = dateUtils.readableDate(date);
            dates.push(date);
            dayCounter++;

            if(dayCounter === playingDates.length) {
                dayCounter = 0;
                weekOffset++;
            }
        }
        return dates;
    }

    return api;
}

export default playoff();