export default {
  props: ['selectedType', 'close'],
  data() {
    return {
      selected: 'User'
    };
  },
  template: `
    <div class="input-group-btn">
      <button @click="close" type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">{{selected}} <span class="caret"></span></button>
      <ul class="dropdown-menu">
        <li><a @click="selected = 'User'; selectedType('user')" href="#">User</a></li>
        <li><a @click="selected = 'Team'; selectedType('team')" href="#">Team</a></li>
        <li><a @click="selected = 'Player'; selectedType('player')" href="#">Player</a></li>
      </ul>
    </div><!-- /btn-group -->
  `
};