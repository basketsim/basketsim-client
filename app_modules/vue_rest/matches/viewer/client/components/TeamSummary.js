import { STAT, STAT_ORDER } from "../../../../utils/client/constants/stat-names";

export default {
  props: ['stats'],

  computed: {
    getCompared() {
      const compared = comparedStats(this.stats);
      return compared;
    },
    statOrder() {
      return STAT_ORDER.slice(1, STAT_ORDER.length);
    }
  },
  template: `
    <div>
      <div v-for="statName in statOrder" class="pcgCont">
        <div class="homeStat" :style="{width: getCompared[statName].home.ratio + '%' }"> </div>
        <div class="homeStatVal"><p>{{getCompared[statName].home.val}}</p></div>
        <div class="awayStat" :style="{width: getCompared[statName].away.ratio + '%' }"></div>
        <div class="awayStatVal"><p>{{getCompared[statName].away.val}}</p></div>
        <div class="statName">{{statName}}</div>
      </div>
    </div>
  `
};

function comparedStats(stats) {
  const compared = {};

  for (let statName in stats.home.stats) {
    let ratio = per(stats.home.stats[statName], stats.away.stats[statName]);
    compared[statName] = {
      home: {
        val: stats.home.stats[statName],
        ratio: ratio.home
      },
      away: {
        val: stats.away.stats[statName],
        ratio: ratio.away
      }
    };
  }

  return compared;

}

function per(homeval, awayval) {
  var total = homeval + awayval;
  var homePer = Math.round(homeval/total * 100);
  var awayPer = 100 - homePer;

  if (total === 0) {
    awayPer = 50;
    homePer = 50;
  }

  return {
    home: homePer,
    away: awayPer
  };
}