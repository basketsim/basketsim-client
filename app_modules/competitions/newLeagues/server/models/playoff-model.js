import Chance from 'chance';
import matchMod from './../../../../matches/server/api.js';
import moment from 'moment';

function playoff() {
    var api = {create, insert, insertMulti, schedule, scheduleMulti, createPlayoffMatch, getResults};
    /**
     * Insert playoff entry and schedule match
     * @param  {string} country
     * @param  {Object} relegatingTeam
     * @param  {Object} promotingTeam
     */
    function insert(country, seasonNum, relegatingTeam, promotingTeam) {
        var playoff = api.createPlayoff(country, seasonNum, relegatingTeam, promotingTeam);
        Playoffs.insert(playoff);
    }

    function insertMulti(playoffList) {
        Playoffs.batchInsert(playoffList);
    }

    /**
     * The order of the team is important!!!
     * team1 needs to be the relegating team!
     * team2 needs to be the promoting team!
     * Further code (getResults) relies on this
     */
    function create(country, seasonNum, relegatingTeam, promotingTeam) {
        var playoff = {
              team1_id: relegatingTeam._id,
              name1: relegatingTeam.name,
              team2_id: promotingTeam._id,
              name2: promotingTeam.name,
              country: country,
              season: seasonNum,
              homescore: 0,
              awayscore: 0
        }

        return playoff;
    }

    function schedule(playoff) {
        var info = {
            collection: 'Playoffs',
            _id: playoff._id,
            season: playoff.season,
            type: 'Playoffs',
            stage: 'Playoffs'
        };
        //CHANGE THIS to day(7)
        var date = moment().day(4).format('YYYY-MM-DD'); //Thursday

        matchMod.setMatch(playoff.team1_id, playoff.team2_id, null, date, null, info);
    }

    function scheduleMulti(playoffList) {
        var matches = [];
        playoffList.forEach(function (playoff) {
            matches.push(api.createPlayoffMatch(playoff));
        });

        if (matches.length > 0) {
            Matches.batchInsert(matches);
        } else {
            console.log('playoff.scheduleMulti no matches');
        }
    }

    function createPlayoffMatch(playoff) {
        var info = {
            collection: 'Playoffs',
            _id: playoff._id,
            season: playoff.season,
            type: 'Playoffs',
            stage: 'Playoffs'
        };
        //change this to 7
        var date = moment().day(4).format('YYYY-MM-DD');

        return matchMod.createMatch(playoff.team1_id, playoff.team2_id, null, date, null, info);
    }

    function getResults(country, seasonNum) {
        var results = {
            relegating: [],
            promoting: [],
            winners: [],
            losers: [],
            pairs: []
        };
        var playoffs = Playoffs.find({country:country, season:seasonNum}).fetch();
        _.each(playoffs, function(playoff){
            results.relegating.push(playoff.team1_id._str);
            results.promoting.push(playoff.team2_id._str);

            if (playoff.homescore > playoff.awayscore) {
                results.winners.push(playoff.team1_id._str);
                results.losers.push(playoff.team2_id._str);
                results.pairs.push({winner: {_str: playoff.team1_id._str, name: playoff.name1}, loser: {_str: playoff.team2_id._str, name:playoff.name2}});
            } else if (playoff.homescore < playoff.awayscore) {
                results.winners.push(playoff.team2_id._str);
                results.losers.push(playoff.team1_id._str);
                results.pairs.push({loser: {_str: playoff.team1_id._str, name: playoff.name1}, winner: {_str: playoff.team2_id._str, name:playoff.name2}});
            }
        });

        // console.log('playoff results', results.winners.length, results.losers.length);
        return results;
    }


    return api;
}

export default playoff();