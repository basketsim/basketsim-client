import { STAT } from "../../../../utils/client/constants/stat-names";

const displayedStats = [STAT.PTS, STAT.PT2_CONVERTED, STAT.PT2_ATTEMPTS, STAT.PT2_P, STAT.PT3_CONVERTED, STAT.PT3_ATTEMPTS,
  STAT.PT3_P, STAT.FT_CONVERTED, STAT.FT_ATTEMPTS, STAT.FT_P, STAT.REB_DEFENSIVE, STAT.REB_OFFENSIVE, STAT.REB_TOTAL,
  STAT.AST, STAT.FOUL, STAT.STL, STAT.TOV, STAT.BLK];

const ROLE = {
  ATT: 'attacking',
  DEF: 'defending'
};
/**
 * I need the players so I know the name of the id in the stat
 * @param logs
 * @param players
 */
function statsFromLogs(logs, emptyStats) {
  if (!emptyStats.home || !emptyStats.away) return emptyStats;
  initStats(emptyStats);
  logs.forEach((log) => {
    saveStat(log, emptyStats);
  });
  allValues(displayedStats, emptyStats);

  return emptyStats;
}

function initStats(emptyStats) {
  const sides = ['home', 'away'];
  const lines = ['onCourt', 'subs'];
  sides.forEach((side) => {
    lines.forEach((line) => {
      emptyStats[side].stats = [];
      displayedStats.forEach((statName) => {
        emptyStats[side].stats[statName] = 0;
      });

      emptyStats[side].lineups[line].forEach((player) => {
        player.stats = [];
        displayedStats.forEach((statName) => {
          player.stats[statName] = 0;
        });
      });
    });
  });
}

function allValues(displayedStats, stats) {
  const sides = ['home', 'away'];
  const lines = ['onCourt', 'subs'];
  displayedStats.forEach((statName) => {
    sides.forEach((side) => {
      lines.forEach((line) => {
        stats[side].stats[statName] = statValue(statName, stats[side]);
        stats[side].lineups[line].forEach((player) => {
          player.stats[statName] = statValue(statName, player);
        });
      });
    });
  });
}

function saveStat(logObj, stats) {
  let log = logObj.log;
  if (!log || !log[ROLE.ATT] || !log[ROLE.DEF]) return;
  let roles = [ROLE.ATT, ROLE.DEF];
  let playerRoles = ['hero', 'sideKick'];
  for (let role of roles) {
    let team = findTeam(log, role, stats);
    if (!team) break;

    playerRoles.forEach((playerRole) => {
      if (log[role][playerRole]) {
        let playerLog = log[role][playerRole];
        let player = findPlayer(playerLog, team);

        if (player) {
          for (let prop in playerLog.stats) {
            if (playerLog.stats.hasOwnProperty(prop)) {
              incrementStats(player.stats, playerLog.stats, prop);
              incrementStats(team.stats, playerLog.stats, prop);
            }
          }
        }
      }
    });
  }

  function incrementStats(stats, log, prop) {
    if (!stats[prop]) {
      stats[prop] = 0;
    }
    stats[prop] += log[prop];
  }
}

function findTeam(log, role, stats) {
  const logTeam = log[role].team;
  if (!logTeam) return null;
  if (stats.home._id._str === logTeam.id) return stats.home;
  return stats.away;
}

function findPlayer(playerLog, team) {
  if (!playerLog) return null;
  const lineups = [team.lineups.onCourt, team.lineups.subs];
  for (let lineup of lineups) {
    for (let player of lineup) {
      if (player._id._str === playerLog.id) return player;
    }
  }
}


function statValue(statName, player) {
  const PT2_ALL = player.stats[STAT.PT2_MISSED] ? player.stats[STAT.PT2_CONVERTED] + player.stats[STAT.PT2_MISSED] : player.stats[STAT.PT2_CONVERTED];
  const PT3_ALL = player.stats[STAT.PT3_MISSED] ? player.stats[STAT.PT3_CONVERTED] + player.stats[STAT.PT3_MISSED] : player.stats[STAT.PT3_CONVERTED];
  const FT_ALL = player.stats[STAT.FT_MISSED] ? player.stats[STAT.FT_CONVERTED] + player.stats[STAT.FT_MISSED] : player.stats[STAT.FT_CONVERTED];
  let p = 0 ;
  switch (statName) {
  case STAT.PT2_ATTEMPTS:
    return PT2_ALL || 0;

  case STAT.PT2_P:
    p = (player.stats[STAT.PT2_CONVERTED] / PT2_ALL * 100) || 0;
    return isNaN(p) ? 0 : parseFloat(p.toFixed(2));

  case STAT.PT3_ATTEMPTS:
    return PT3_ALL || 0;

  case STAT.PT3_P:
    p = (player.stats[STAT.PT3_CONVERTED] / PT3_ALL * 100) || 0;
    return isNaN(p) ? 0 : parseFloat(p.toFixed(2));

  case STAT.FT_ATTEMPTS:
    return FT_ALL || 0;

  case STAT.FT_P:
    p = (player.stats[STAT.FT_CONVERTED] / FT_ALL * 100) || 0;
    return isNaN(p) ? 0 : parseFloat(p.toFixed(2));

  case STAT.REB_TOTAL:
    return (player.stats[STAT.REB_DEFENSIVE] + player.stats[STAT.REB_OFFENSIVE]);

  default:
    return player.stats[statName];
  }
}

export { statsFromLogs, displayedStats };