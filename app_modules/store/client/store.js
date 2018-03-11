import players from './modules/players';
import bookmarks from './modules/bookmarks';
import matchLogs from './modules/matchLogs';
import Vue from 'vue/dist/vue.common';
import Vuex from 'vuex';

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    players, bookmarks, matchLogs
  }
});

/**
 * Mutations
 */
const m = {
  players: {
    SELECTED_ID: 'players/selectedID'
  },
  bookmarks: {
    CAN_USE_CACHE: 'bookmarks/canUseCache',
    COLLECTION_MERGE: 'bookmarks/collectionMerge'
  },
  matchLogs: {
    COLLECTION_REPLACE: 'matchLogs/collectionReplace',
    COLLECTION_PUSH: 'matchLogs/collectionPush',
    SET_DISPLAYED_STATS: 'matchLogs/setDisplayedStats'
  }
};

/**
 * Actions
 */
const a = {
  players: {
    FETCH: 'players/fetch'
  },
  bookmarks: {
    BOOKMARKS_INSERT: 'bookmarks/insert',
    BOOKMARKS_FETCH: 'bookmarks/fetch',
    BOOKMARKS_DELETE: 'bookmarks/delete'
  },
  matchLogs: {
    FETCH: 'matchLogs/fetch',
    FETCH_PLAYERS: 'matchLogs/fetchPlayers'
  }
};

/**
 * Getters
 */
const g = {
  players: {},
  bookmarks: {
    CATEGORIES: 'bookmarks/categories',
    PLAYERS_ID_LIST: 'bookmarks/playersIDList'
  }
};

export {store, m, a, g};