import {Meteor} from 'meteor/meteor';
import { MatchLogs } from '../../../../collections/collections';
import Matches from '../../../../collections/Matches';

Meteor.publish('match-viewer', function(matchID) {
  const matchLogs = MatchLogs.findOne({match_id: matchID});
  const match = Matches.findOne({_id: matchID}, {endDate: 1, dateTime:1 });
  const endTimestamp = match.endDate.valueOf();
  const sentLogs = [];
  const self = this;

  matchLogs.logs.forEach((log, i) => { log.id = i; });

  // Send all initial logs
  sendLogs(matchLogs.logs, match, self, sentLogs);
  self.ready();

  //Start live only if needed
  if (Date.now() < endTimestamp) {
    var interval = setInterval(()=> {
      sendLogs(matchLogs.logs, match, self, sentLogs);
    }, 1000 * 50);
  } else {
    self.stop();
  }

  // It's very important to clean up things in the subscription's onStop handler
  this.onStop(() => {
    if (interval) clearInterval(interval);
  });
});

function sendLogs(logs, match, self, sentLogs) {
  const startTimestamp = match.dateTime.timestamp;
  const matchID = match._id;
  const timeLimit = Date.now() + (60 * 1000); //60 seconds in the future

  for (let log of logs) {
    let logTime = log.historicTime * 1000 + startTimestamp;
    if (timeLimit > logTime) {
      if (sentLogs.includes(log.id)) continue;
      self.added('live_match_logs', `${matchID}_${log.id}`, {matchID:matchID, log: log});
      sentLogs.push(log.id);
    } else {
      return;
    }
  }
}