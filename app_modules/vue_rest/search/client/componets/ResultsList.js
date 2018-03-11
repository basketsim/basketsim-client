import ItemTeam from './ItemTeam';
import ItemUser from './ItemUser';
import ItemPlayer from './ItemPlayer';

export default {
  props: ['selected', 'items'],
  components: {
    'item-team': ItemTeam,
    'item-user': ItemUser,
    'item-player': ItemPlayer,
  },
  template: `
    <div id="results-list">
      <div v-for="item in items"> 
        <item-team v-if="selected === 'team' " :team="item"></item-team> 
        <item-player v-if="selected === 'player' " :player="item"></item-player> 
        <item-user v-if="selected === 'user' " :user="item"></item-user> 
      </div>
      <div v-if="!items[0]" style="padding: 4px">No results found</div>
    </div>
  `
};