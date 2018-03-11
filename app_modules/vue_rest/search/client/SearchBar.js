import Vue from 'vue/dist/vue.common';
import SelectType from './componets/SelectType';
import ResultsList from './componets/ResultsList';
import {Meteor} from 'meteor/meteor';

export default (el) => {
  return new Vue({
    el: el,
    components: {
      'select-type': SelectType,
      'results-list': ResultsList
    },
    data() {
      return {
        selected: 'user',
        searchInput: '',
        shown: false,
        skip: 0,
        allItems: [],
        items: [],
        waiting: false
      };
    },
    computed: {
      addonClass() {
        return {
          'ion-ios-search-strong': !this.waiting,
          'ion-load-a': this.waiting
        };
      },
      hasPrev() {
        return (this.skip > 0);
      },
      hasNext() {
        return (this.allItems.length > this.skip+5);
      }
    },
    methods: {
      selectedType(selected) {
        this.selected = selected;
        this.skip = 0;
      },
      resetSkip() {
        this.skip = 0;
      },
      previous() {
        if (this.skip < 5) {
          this.skip = 0;
        } else {
          this.skip -= 5;
        }

        this.items = this.allItems.slice(this.skip, this.skip + 5);
      },
      next() {
        if (this.skip > 40) {
          this.skip = 45;
        } else {
          this.skip += 5;
        }

        this.items = this.allItems.slice(this.skip, this.skip + 5);
      },
      close(event) {
        const keepText = event.target.className === 'btn-link' ? false : true;
        this.shown = false;
        this.skip = 0;
        if (!keepText) this.searchInput = '';
      },
      searchOnEnter(event) {
        if(event.key === 'Enter') this.search();
      },
      search() {
        const self = this;

        if (self.searchInput.length > 24) {
          sAlert.error('Search query can be of max 24 characters');
          return;
        }
        if (this.waiting) return;

        const searchHandler = (err, res) => {
          self.shown = true;
          self.waiting = false;
          self.allItems = res;
          self.items = self.allItems.slice(self.skip, self.skip + 5);
        };

        self.waiting = true;
        switch (self.selected) {
        case 'user':
          Meteor.call('GET:search/users', {find: {name: self.searchInput}}, searchHandler);
          break;
        case 'team':
          Meteor.call('GET:search/teams', {find: {name: self.searchInput}}, searchHandler);
          break;
        case 'player':
          Meteor.call('GET:search/players', {find: {name: self.searchInput}}, searchHandler);
          break;
        default:
          sAlert.error(`${self.selected} is not a valid selection`);
        }

      }
    },
    template: `
      <div class="search-bar" style="margin-bottom: 10px">
        <div class="input-group input-group-sm" style="clear: left; max-width: 210px;">
          <select-type :selectedType = "selectedType" :close="close" class="keepText"></select-type>
          <input v-model="searchInput" type="text" class="form-control" aria-label="..." @keyup="searchOnEnter" @keydown="resetSkip">
          <span class="input-group-addon" id="basic-addon1" style="cursor: pointer" @click="search">
            <i v-if="!waiting" class="ion-ios-search-strong"></i>
            <i v-if="waiting" class="ion-load-a"></i>
          </span>
        </div>
        <div v-if="shown" id="search-popup">
          <results-list :selected="selected" :items="items"></results-list>
          <div class="row" id="show-more" style="border-bottom: whitesmoke; border-bottom-style: solid; border-width: 1px;">
            <div class="col-xs-4" style="text-align: left"><span v-if="hasPrev" class="btn-link"  @click="previous">Prev</span></div>
            <div class="col-xs-4" style="text-align: center"><span class="btn-link" @click="close">Close</span></div>
            <div class="col-xs-4" style="text-align: right"><span v-if="hasNext" class="btn-link" @click="next">Next</span></div>
          </div>
        </div>
      </div>
      <!--<div></div>-->
    `
  });
};