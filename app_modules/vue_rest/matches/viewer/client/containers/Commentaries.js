import Commentary from '../components/Commentary';
import TeamSummary from './../components/TeamSummary';
import Attendance from './../components/Attendance';

export default {
  props: ['stats', 'matchLogs', 'emptyStats', 'attendance'],
  updated() {
    this.$refs.commentaries.scrollTop = this.$refs.commentaries.scrollHeight;
  },
  computed: {
    commentaries() {
      return getCommentaries(this.matchLogs, this.emptyStats, this);
    }
  },
  methods: {
    teamHref(team) {
      if (team && team._id) return '/teams/' + team._id._str;
      return '#';
    }
  },
  data: () => {
    return {
      score: {
        home: 0,
        away: 0
      },
      isMinimized: true,
      attendanceShown: false
    };
  },
  components: {
    'commentary': Commentary,
    'team-summary': TeamSummary,
    'attendance': Attendance,
  },
  template: `
    <div class="card white">
      <div class="card-image-header team-matches" style="height: 100px">
        <div class="card-title" style="padding-top: 60px; padding-left:15px; font-size:22px ">
        <a class="discrete dwhite" :href="teamHref(this.emptyStats.home)" target="_blank">{{this.emptyStats.home.name}}</a> 
        {{this.score.home}} - {{this.score.away}}
        <a class="discrete dwhite" :href="teamHref(this.emptyStats.away)" target="_blank">{{this.emptyStats.away.name}}</a>
        </div>
      </div>
      <div class="row">
        <div class="col-sm-5 col-lg-3"> <team-summary :stats="stats"></team-summary> </div>
        <div class="col-sm-7 col-lg-9">
          <div ref="commentaries" class="card-content black-text live-text" :class="{'commentaries-min': isMinimized}">
            <commentary v-for="commentary in commentaries" :key="commentary.id" :commentary="commentary"></commentary>
          </div>
        </div>
      </div>
      <div class="row" v-if="attendanceShown">
        <div class="col-xs-12"><attendance :attendance="attendance"></attendance></div>
      </div>
      <div class="card-action">
        <button @click="isMinimized = !isMinimized" type="button" class="btn btn-link">
           <span v-if="isMinimized">Expand Commentaries</span> 
           <span v-if="!isMinimized">Minimize Commentaries</span>
        </button>
        <button @click="attendanceShown = !attendanceShown" class="btn btn-link" style="margin-left: 5px">
           <span v-if="attendanceShown">Hide Attendance</span> 
           <span v-if="!attendanceShown">Show Attendance</span>
        </button>
      </div>
    </div>    
  `
};

function getCommentaries(matchLogs, stats, self) {
  if (!matchLogs) return [];
  const commentaries = [];
  self.score = {
    home: 0,
    away: 0
  };
  const score = self.score;
  let savedLabels = [];
  // This will be used both for commentaries and stats. So you'd have to move it
  matchLogs.forEach(function (logObj, i) {
    let log = logObj.log;
    if (!log.description) savedLabels = savedLabels.concat(getLabels(log, stats));
    if (log.description) {
      increaseScore(log, stats, score);
      let labels = savedLabels.length > 0 ? savedLabels.splice(0) : [];
      labels = labels.concat(getLabels(log, stats));

      //check for walkovers and modify score if found one
      if (log.description === 'walkover' || log.description === 'walkover_start') {
        let side = log.attacking.team.id === stats.home._id._str ? 'home' : 'away';
        let other = side === 'home' ? 'away' : 'home';
        score[side] = 1;
        score[other] = 20;
      }
      commentaries.push({
        index: i,
        text: formatDescriptionText(log, stats, score),
        time: time(log.displayTime),
        event: log.description,
        labels: labels,
        score: {
          home: score.home,
          away: score.away
        }
      });
    }
  });

  return commentaries;
}

function formatDescriptionText(log, stats, score) {
  var finalEvent = log.descriptionText;
  if (finalEvent.indexOf("{{att.hero}}") !== -1) {
    finalEvent = finalEvent.replace(/{{att.hero}}/g, getPlayerName(log, stats, 'att', 'hero'));
  }
  if(finalEvent.indexOf("{{def.hero}}") !== -1) {
    finalEvent = finalEvent.replace(/{{def.hero}}/g, getPlayerName(log, stats, 'def', 'hero'));
  }
  if(finalEvent.indexOf("{{att.sidekick}}") !== -1) {
    finalEvent = finalEvent.replace(/{{att.sidekick}}/g, getPlayerName(log, stats, 'att', 'sideKick'));
  }
  if(finalEvent.indexOf("{{def.sidekick}}") !== -1) {
    finalEvent = finalEvent.replace(/{{def.sidekick}}/g, getPlayerName(log, stats, 'def', 'sideKick'));
  }
  if(finalEvent.indexOf("{{att.team}}") !== -1) {
    finalEvent = finalEvent.replace(/{{att.team}}/g, getTeamName(log, stats, 'att'));
  }
  if(finalEvent.indexOf("{{def.team}}") !== -1) {
    finalEvent = finalEvent.replace(/{{def.team}}/g, getTeamName(log, stats, 'def'));
  }
  if(finalEvent.indexOf("{{home.score}}") !== -1) {
    finalEvent = finalEvent.replace(/{{home.score}}/g, score.home);
  }
  if(finalEvent.indexOf("{{away.score}}") !== -1) {
    finalEvent = finalEvent.replace(/{{away.score}}/g, score.away);
  }
  //add time
  // finalEvent = displayEvent(mevent, finalEvent);
  return finalEvent;
}

function time(seconds) {
  return Math.ceil(seconds/60);
}

function getPlayerName(log, stats, side, role) {
  const phase = side === 'att' ? 'attacking' : 'defending';
  const logPlayerID = log[phase][role].id;
  const teamColor = getTeamAndColor(log, stats, phase);
  var team = teamColor.team;
  var color = teamColor.color;

  const lineups = [team.lineups.onCourt, team.lineups.subs];
  var player = null;

  for (let lineup of lineups) {
    player = lineup.find((p) => {return p._id._str === logPlayerID;});
    if (player) break;
  }
  if (!player) debugger;
  const html = `<a style="color: ${color}" href="/players/${player._id._str}" target="_blank"> ${player.name} </a>`;
  return html;
}

function getTeamName(log, stats, side) {
  const phase = side === 'att' ? 'attacking' : 'defending';
  const teamColor = getTeamAndColor(log, stats, phase);

  const html = `<a style="color: ${teamColor.color}" href="/teams/${teamColor.team._id._str}" target="_blank"> ${teamColor.team.name} </a>`;
  return html;
}

function getTeamAndColor(log, stats, phase) {
  const logTeamID = log[phase].team.id;
  var team = null;
  var color = null;
  if (stats.home._id._str === logTeamID) {
    team = stats.home;
    color = '#08b355';
  } else {
    team = stats.away;
    color = '#0068D0';
  }

  return {
    team, color
  };
}

function getLabels(log, stats) {
  const displayed = ['2P', '2PM', '3P', '3PM', 'FT', 'FTM', 'DRB', 'ORB', 'FO', 'STL','TO','BLK','INJ', 'SUB'];
  const sides = ['attacking', 'defending'];
  const playerRoles = ['hero', 'sideKick'];
  const labels = [];

  sides.forEach((side) => {
    let teamColor = (log[side].team && log[side].team.id) ? getTeamAndColor(log, stats, side) : {color: null};
    let logTeam = log[side];
    playerRoles.forEach((playerRole) => {
      if (logTeam && logTeam[playerRole] && logTeam[playerRole].stats) {
        let stats = logTeam[playerRole].stats;
        for (let stat in stats) {
          if (displayed.includes(stat) && stats[stat] !== 0) {
            labels.push({stat: stat, color: teamColor.color});
          }
        }
      }
    });
  });

  return labels;
}

function increaseScore(log, stats, score) {
  const sides = [log.attacking, log.defending];
  const playerRoles = ['hero', 'sideKick'];

  sides.forEach((side) => {
    playerRoles.forEach((playerRole) => {
      if (side && side[playerRole] && side[playerRole].stats && side[playerRole].stats.PTS) {
        let sideField = side.team.id === stats.home._id._str ? 'home' : 'away';
        score[sideField] += side[playerRole].stats.PTS;
      }
    });
  });
}