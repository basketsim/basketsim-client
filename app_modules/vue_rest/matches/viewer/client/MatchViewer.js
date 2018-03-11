import Commentaries from './containers/Commentaries';
import Ratings from './components/Ratings';
import Potential from './components/Potential';
import TeamSummary from './components/TeamSummary';
import {store, a, m} from '../../../../store/client/store';
import {Meteor} from 'meteor/meteor';
import { sAlert } from 'meteor/juliancwirko:s-alert';
import { callPromise } from "../../../utils/client/async/callPromise";
import {statsFromLogs} from "./helpers/stats-from-logs";
import Vue from 'vue/dist/vue.common';

export default (el, matchID, reactiveSource) => {
  return new Vue({
    el: el,
    data: () => {
      return {
        matchID: matchID,
        liveInterval: null,
        attendance: null,
        match: {
          homeTeam: {
            defensive: '',
            offensive: ''
          },
          awayTeam: {
            defensive: '',
            offensive: ''
          }
        },
        emptyStats: {
          home: {
            lineups: {
              onCourt: [],
              subs: []
            }
          },
          away: {
            lineups: {
              onCourt: [],
              subs: []
            }
          }
        },
        potential: null,
        availableLogs: [],
        lastLogID: 0
      };
    },
    created: async function () {
      const self = this;

      //Assume this is ready by the time initMatchLogs is called.
      //If having issues, you could call a method first and subscribe to the publication only if the match is running
      reactiveSource.observeChanges({
        added(id, doc) {
          let log = self.availableLogs.find((el) => {return el.log.id === doc.log.id});
          if (!log) self.availableLogs.push(doc);
        }
      });

      const stats = await callPromise('GET:matches/stats/empty', {find: {match_id: matchID}}).catch((e) => {sAlert.error(e)});
      self.emptyStats = stats.stats;
      self.attendance = stats.attendance;

      const matches = await callPromise('GET:matches', {find: {_id: matchID}, fields: {
        endDate: 1, dateTime: 1, 'homeTeam.defensive': 1, 'homeTeam.offensive': 1, 'awayTeam.defensive': 1, 'awayTeam.offensive':1}
      }).catch((e) => {{sAlert.error(e.reason); return;}});
      const match = matches[0];
      this.match = match;
      self.potential = await getPotential(match.endDate, matchID);
      initMatchLogsCollection(match, self.availableLogs, self);
      self.liveInterval = startLiveInterval(match.dateTime.timestamp, match.endDate, self.availableLogs, self);
      // the above can return something that decides if the ratings can be shown
    },
    beforeDestroy() {
      if (this.liveInterval) clearInterval(this.liveInterval);
      store.commit(m.matchLogs.COLLECTION_REPLACE, []);
    },
    computed: {
      matchLogs() {
        return store.state.matchLogs.collection;
      },
      side() {
        return store.state.matchLogs.displayedStats;
      },
      stats() {
        if (!this.emptyStats.home._id) return this.emptyStats;
        const stats = statsFromLogs(this.matchLogs, this.emptyStats);
        return stats;
      },
      tactics() {
        return {
          home: {
            defensive: this.match.homeTeam.defensive,
            offensive: this.match.homeTeam.offensive
          },
          away: {
            defensive: this.match.awayTeam.defensive,
            offensive: this.match.awayTeam.offensive
          }
        }
      }
    },
    components: {
      'commentaries': Commentaries,
      'ratings': Ratings,
      'potential': Potential,
      'team-summary': TeamSummary
    },
    destroyed: function () {
      this.$el.remove();
    },
    template: `
      <div>
        <commentaries v-if="stats.home._id" :stats="stats" :matchLogs="matchLogs" :emptyStats="emptyStats" :attendance="attendance"></commentaries>
        <ratings v-if="stats.home._id" :stats="stats" :side="side" :matchID="matchID"></ratings>
        <potential :potential="potential" :tactics="tactics"></potential>
      </div>
    `
  });
};

/**
 *
 * @param match
 * @returns {Promise.<null>}
 */
async function getPotential(endDate, matchID) {
  const endTimestamp = endDate.valueOf();
  var potential = null;

  if (Date.now() > endTimestamp) {
    potential = await callPromise('GET:matches/stats/potential', {find: {match_id: matchID}}).catch((e) => {sAlert.error(e)});
  }

  return potential;
}

function initMatchLogsCollection(match, logs, self) {
  let displayedLogs = logs.filter((logObj) => {
    let log = logObj.log;
    let time = match.dateTime.timestamp + (log.historicTime * 1000);
    return Date.now() > time;
  });

  store.commit(m.matchLogs.COLLECTION_REPLACE, displayedLogs);

  if (displayedLogs[displayedLogs.length - 1] && displayedLogs[displayedLogs.length - 1]) {
    self.lastLogID = displayedLogs[displayedLogs.length - 1].log.id;
  }
}

/**
 * Assume logs are in order
 * @param endDate
 * @param logs
 * @param self
 * @returns {*}
 */
function startLiveInterval(startTime, endDate, logs, self) {
  const endTimestamp = endDate.valueOf();
  const interval = Date.now() > endTimestamp ? null : setInterval(()=> {
    const nextLogObj = logs[self.lastLogID + 1];
    if (nextLogObj) {
      let logTime = nextLogObj.log.historicTime * 1000 + startTime;

      if (Date.now() > logTime) {
        store.commit(m.matchLogs.COLLECTION_PUSH, nextLogObj);
        self.lastLogID ++;
      }
    }

    stopLiveInterval(interval, endDate, self);
  }, 1000);

  return interval;
}

function stopLiveInterval(interval, endDate, self) {
  if (!interval) return;
  const endTimestamp = endDate.valueOf();
  if (Date.now() > endTimestamp) {
    clearInterval(interval);
    self.potential = getPotential(endDate);
  }
}