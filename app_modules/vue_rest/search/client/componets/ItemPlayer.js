export default {
  props: ['player'],
  computed: {
    url() {
      if (!this.player) return '';
      return `/players/${this.player._id._str}`;
    },
    teamUrl() {
      if (!this.player) return '';
      return `/teams/${this.player.team._id._str}`;
    },
    ev() {
      let val = '';
      if (!this.player) return val;
      if (this.player.ev < 1000000) {
        val = Math.floor(this.player.ev / 1000) + 'k';
      } else {
        val = Math.floor(this.player.ev / 1000000) + 'm';
      }

      return val;
    }
  },
  template: `
    <div style="padding: 2px 4px 2px 4px; border-bottom: whitesmoke; border-bottom-style: solid; border-width: 1px;"> 
    <a :href="url">{{player.fullName}}</a>, {{player.country}} <br>
      {{player.age}} y/o, EV: {{ev}} $ <br>
      <a :href="teamUrl">{{player.team.name}}</a>
    </div>
  `
};