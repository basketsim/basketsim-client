import {DENOMINATIONS, TACTIC_SHORT} from "../../../../utils/client/constants/stat-names";

export default {
  props: ['potential', 'tactics'],

  methods: {
    tactic(whichSide, phase) {
      return TACTIC_SHORT[this.tactics[whichSide][phase]];
    },
    defensive(potential) {
      const mapping = [
        ['stop_possession', 'Stop Possession'],
        ['fouling', 'Foul Avoidance'],
        ['rebounds_defense', 'Def Rebounds'],
        ['defend_assisted', 'Zone Defense'],
        ['defend_individual', 'Man-To-Man Def']
      ];
      const defProp = [];

      for (let ability of mapping) {
        let name = ability[1];
        let value = potential[ability[0]];
        if (name) {
          defProp.push([name, `<span class="hidden-xs"> ${DENOMINATIONS[value]} </span> <span>(${value})</span> `]);
        }
      }

      return defProp;
    },

    offensive(potential) {
      const mapping = [
        ['possession', 'Possession'],
        ['assist_quality', 'Assist Quality'],
        ['rebounds_offense', 'Off Rebounds'],
        ['shoot_2p_assisted', 'Assisted 2P'],
        ['shoot_2p_individual', 'Individual 2P'],
        ['shoot_3p_assisted', 'Assisted 3P'],
        ['shoot_3p_individual', 'Individual 3P']
      ];

      const offProp = [];

      for (let ability of mapping) {
        let name = ability[1];
        let value = potential[ability[0]];
        if (name) {
          offProp.push([name, `<span class="hidden-xs"> ${DENOMINATIONS[value]} </span> <span>(${value})</span> `]);
        }
      }

      return offProp;
    }
  },
  template: `
    <div class="row">
      <div v-for="side in potential" class="col-xs-12">
        <div v-if="side.potential" class="card white">
          <div class="card-header tactics blue">
            <div class="card-title white-text" style="padding-bottom: 5px; padding-top: 5px; font-size: 18px">
               Potential: {{side.name}}
            </div>
          </div>
          <div class="card-content" style="padding: 0px 5px; font-weight: 400">
            <div class="row">
            
              <div class="col-xs-6">
                <table class="table table-condensed">
                  <tbody>
                    <tr>
                      <th colspan="2" style="font-weight: 600">Defensive</th>
                    </tr>
                    <tr><td style="padding-left: 5px!important;">Tactic:</td> <td>{{tactic(side.which, 'defensive')}}</td> </tr>
                    <tr v-for="prop in defensive(side.potential)">
                      <td style="width: 120px; padding-left: 5px!important;">{{prop[0]}}:</td>
                      <td v-html="prop[1]"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div class="col-xs-6">
                <table class="table table-condensed">
                  <tbody>
                    <tr>
                      <th colspan="2" style="font-weight: 600">Offensive</th>
                    </tr>
                    <tr><td style="padding-left: 5px!important;">Tactic:</td> <td>{{tactic(side.which, 'offensive')}}</td></tr>
                    <tr v-for="prop in offensive(side.potential)">
                      <td style="width: 112px; padding-left: 5px!important;">{{prop[0]}}:</td>
                      <td v-html="prop[1]"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  `
};