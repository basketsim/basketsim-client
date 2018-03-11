import {sAlert} from 'meteor/juliancwirko:s-alert';

export default {
  namespaced: true,
  state: {
    collection: [],
    displayedStats: ''
  },
  mutations: {
    collectionReplace: function (state, newItems) {
      state.collection = newItems;
    },
    collectionPush: function (state, newItem) {
      let log = state.collection.find((el) => {return el.log.id === newItem.log.id; });
      if (!log) state.collection.push(newItem);
    },
    setDisplayedStats: function (state, newState) {
      state.displayedStats = newState;
    }
  },
  actions: {

  },
  getters: {

  }
};

