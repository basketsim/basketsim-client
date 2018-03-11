export default {
  props: ['commentary'],
  created: () => {
  },
  computed: {
    // labels() {
    //   let time = `<span style="width: 10px"> ${this.commentary.time}′ </span>`;
    //   return time + this.commentary.text;
    // }
  },
  template: `
    <div class="cmt">
      <div class="row">
        <div class="col-xs-1" style="max-width: 22px">{{this.commentary.time}}′</div>
        <div class="col-xs-2 col-lg-2" style="max-width: 70px">
          <span v-for="label in this.commentary.labels" :style="{color:label.color, 'font-weight':600, 'margin-right': '5px'}">{{label.stat}}</span>
        </div>
        <div class="col-xs-9 col-lg-9">
          <p v-html="this.commentary.text"></p>
        </div>
      </div>
    </div>
  `
};
