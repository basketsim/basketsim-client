import { STAT } from "../../../../utils/client/constants/stat-names";
import { statsFromLogs, displayedStats } from "../helpers/stats-from-logs";
import TeamSummary from './TeamSummary';

import _ from 'underscore';

export default {
  props: ['stats', 'side', 'matchID'],
  created: () => {

  },
  data() {
    return {
      homeUrl: `/match-viewer/${this.matchID}/home`,
      awayUrl: `/match-viewer/${this.matchID}/away`
    };
  },
  components: {
    'team-summary': TeamSummary
  },
  computed: {
    displayedStats() {
      return displayedStats;
    },
    color() {
      return this.side === 'home' ? '#08b355' : '#0068D0';
    },
    teamStats() {
      return this.stats[this.side];
    }
  },
  methods: {
    playerHref(player) {
      if (player && player._id) return `/players/${player._id._str}`;
      return '#';
    },
    eff(stats) {
      const r = stats;
      var points = r.FT + r['2P'] * 2 + r['3P'] * 3;
      var rebs = r.ORB + r.DRB;
      var missedfg = (r['2PA'] - r['2P']) + (r['3PA'] - r['3P']);
      var missedft = r.FTA - r.FT;

      var eff = points + rebs + r.AST + r.STL + r.BLK - missedfg - missedft - r.TO;

      return eff;
    }
  },
  template: `
    <div class="rtg">
      <div class="card white bigger">
        <div class="row">
          <div class="col-xs-12">
            <div class="table-responsive">
              <table class="table table-condensed table-striped table-hover table-card">
                <tbody>
                  <tr class="white-text blue" :style="{'background-color': color }">
                    <th>Name</th>
                    <th>EFF</th>
                    <th v-for="name in displayedStats">{{name}}</th>
                  </tr>
                  <tr v-for="player in teamStats.lineups.onCourt">
                    <td style="min-width: 180px"><a :href="playerHref(player)" target="_blank" class="discrete black">{{player.name}}</a></td>
                    <td>{{eff(player.stats)}}</td>
                    <td v-for="name in displayedStats"> {{player.stats[name]}} </td>
                  </tr>
                  <tr v-for="player in teamStats.lineups.subs">
                    <td style="min-width: 180px"> <a :href="playerHref(player)" target="_blank" class="discrete black">{{player.name}}</a></td>
                    <td>{{eff(player.stats)}}</td>
                    <td v-for="name in displayedStats"> {{player.stats[name]}} </td>
                  </tr>
                  <tr>
                    <td>{{teamStats.name}}</td>
                    <th> </th>
                    <td v-for="name in displayedStats"> {{teamStats.stats[name]}} </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div class="card-action">
          <a :href="homeUrl">Home Stats</a>
          <a :href="awayUrl">Away Stats</a>
        </div>
      </div>
    </div>
  `
};