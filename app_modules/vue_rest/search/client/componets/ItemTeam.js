export default {
  props: ['team'],
  computed: {
    compName() {
      if (!this.team) return '';
      const snum = Object.keys(this.team.competitions.natLeague.seasons)[0];
      return this.team.competitions.natLeague.seasons[snum].name;
    },
    url() {
      if (!this.team) return '';
      return `/teams/${this.team._id._str}`;
    }
  },
  template: `
    <div style="padding: 2px 4px 2px 4px; border-bottom: whitesmoke; border-bottom-style: solid; border-width: 1px;"> 
    <a :href="url">{{team.name}}</a>, {{team.userinfo.username}} <br>
      {{team.country}}, {{compName}}
    </div>
  `
};