import leagues from './../../competitions/leagues/server/api.js';
import natcups from './../../competitions/national-cup/server/api.js';
import news from './../../news/server/api.js';
import stats from './../../stats/server/perMatch.js';
import Matches from "../../../collections/Matches";

import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';

function updates() {
    var api = {simExternal, finish, forceFinish, finishTest, archive, _liveFinished, _updateCompetition};

  function simExternal() {
    const simThreshold = 14 * 60 * 1000; //14 minutes before game
    const now = new Date().valueOf();
    const runningTime = now + simThreshold;
    const matches = Matches.find({'competition.collection': {$in: ['Leagues', 'Playoffs', 'NationalCups']}, 'state.simulated':false, 'dateTime.timestamp':{$lt: runningTime}}, {fields: {_id: 1}}).fetch();

    simMatch(matches, 0);
  }

  function simMatch(matches, index) {
    if (index === matches.length) return;

    let match = matches[index];
    HTTP.call('GET', `${Meteor.settings.engine_service}/sim/${match._id}`, (err, res) => {
      if (!err) {
        console.log(`simulated ${index+1} / ${matches.length} matches`);
        simMatch(matches, index+ 1);
      } else {
        throw new Meteor.Error(err);
      }
    });
  }

    function finish() {
      let matches = Matches.find({'state.simulated': true, 'state.finished': false, endDate: {$lt: new Date()}}).fetch();
      finishMatch(matches, 0);
    }

    function finishMatch(matches, index) {
      if (index === matches.length) return;

      let match = matches[index];

      HTTP.call('GET', `${Meteor.settings.engine_service}/matches/${match._id}/state/finished`, (err, res) => {
        if (!err) {
          console.log(`finished ${index+1} / ${matches.length} matches`);
          finishMatch(matches, index+ 1);
        } else {
          console.log('gets into err', err);
          throw new Meteor.Error(err);
        }
      });
    }

    function forceFinish() {
        var matches = Matches.find({'state.simulated': true, 'state.finished': false}, {fields: {matchHistory:0}}).fetch();
        console.log('matches to update', matches.length);
        var finished = 0;
        var countries = [];

        _.each(matches, function(match, i){
            api._updateCompetition(match);
            finished++;
            countries.push(match.country);
            stats.update(match);
            news.game.matchPlayed(match._id, match.homeTeam.id, match.awayTeam.id, match.homeTeam.matchRatings.score, match.awayTeam.matchRatings.score, match.competition.collection);
            console.log('updated matches:', i, '/', matches.length);
        });
    }

    function finishTest() {
        var matches = Matches.find({ 'optional.test': true }).fetch();
        console.log('matches to update', matches.length);
        var finished = 0;
        var countries = [];

        _.each(matches, function(match, i){
            api._updateCompetition(match);
            finished++;
            countries.push(match.country);
            stats.update(match);
            news.game.matchPlayed(match._id, match.homeTeam.id, match.awayTeam.id, match.homeTeam.matchRatings.score, match.awayTeam.matchRatings.score, match.competition.collection);
            console.log('updated matches:', i, '/', matches.length)
        });
    }

    function archive() {
        var timeLimit = moment().subtract(7, 'days').valueOf();
        // var matches = Matches.find({'state.simulated': true, 'state.finished': true, 'dateTime.timestamp':{$lt: timeLimit}}, {fields:{_id:true}}, {limit:500}).fetch();
        news.admin.archiveMatchesStarted();
        Matches.update(
            {'matchHistory.archived':{$not: {$exists: true}}, 'state.simulated': true, 'state.finished': true, 'dateTime.timestamp':{$lt: timeLimit}},
            {$set:{matchHistory:{
                archived: true
            }}},
            {multi:true},
            function(err, modified){
                console.log('err:', err);
                console.log('modified:', modified);
            });
        news.admin.archiveMatchesEnded();
    }

    /**
     * Check if live finished
     * @param  {[type]} match [description]
     * @return {[type]}       [description]
     */
    function _liveFinished(match) {
        var currTime = Date.now();
        if (currTime > match.dateTime.timestamp+ match.matchHistory.info.totalTime*1000) {
            return true;
        } else {
            return false;
        }
    }

    function _updateCompetition(match) {
        switch(match.competition.collection) {
            case 'Leagues':
            leagues.updates.updateMatch(match);
            break;
            case 'NationalCups':
            natcups.updates.updateMatch(match);
            break;
            case 'PheonixTrophy':
            updatePheonixTrophy(match);
            break;
            case 'Playoffs':
            leagues.playoff.update(match);
            break;
        }
    }

    return api;
}

export default updates();