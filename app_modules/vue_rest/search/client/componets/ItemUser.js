export default {
  props: ['user'],
  computed: {
    compName() {
      if (!this.user) return '';
      const snum = Object.keys(this.user.team.competitions.natLeague.seasons)[0];
      return this.user.team.competitions.natLeague.seasons[snum].name;
    },
    url() {
      if (!this.user) return '';
      return `/club/${this.user._id._str}`;
    }
  },
  template: `
    <div style="padding: 2px 4px 2px 4px; border-bottom: whitesmoke; border-bottom-style: solid; border-width: 1px;"> 
    <a :href="url">{{user.username}}</a>, {{user.team.name}} <br>
      {{user.team.country}}, {{compName}}
    </div>
  `
};