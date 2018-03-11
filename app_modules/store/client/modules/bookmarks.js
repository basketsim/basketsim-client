import pushOrReplace from './../helpers/pushOrReplace';
import {Meteor} from 'meteor/meteor';
import {sAlert} from 'meteor/juliancwirko:s-alert';
import {store, a} from './../store';

import _ from 'underscore';
/**
 * Bookmarks module
 * The useCache is used to avoid fetching the whole bookmarks for every player visited.
 * This works since bookmarks are updated from one place only
 * It will not be in sync across all devices
 */
export default {
    namespaced: true,
    state: {
        collection: [],
        canUseCache: false
    },
    mutations: {
        canUseCache: function (state, canUse) {
            state.canUseCache = canUse;
        },
        collectionMerge: function (state, newItems) {
            state.collection = pushOrReplace(state.collection, newItems, '_id._str');
        },
        removeItem: function (state, itemIDStr) {
            state.collection = state.collection.filter((item) => {return item._id._str !== itemIDStr; });
        }
    },
    actions: {
        insert: function (context, {playerID, category}) {
            Meteor.call('players:bookmarks:create', playerID, category, function (err, inserted) {
                if (err) {
                    sAlert.error(err.reason);
                } else {
                    sAlert.success('Player Bookmarked!');
                    context.commit('collectionMerge', [inserted]);
                    // store.dispatch(a.bookmarks.BOOKMARKS_FETCH);
                }
            });
        },
        fetch: function (context, query) {
            if (context.state.canUseCache) return;

            Meteor.call('players:bookmarks:read', query, function (err, bookmarks) {
                if (!err) {
                    context.commit('collectionMerge', bookmarks);
                } else {
                    sAlert.error(err.reason);
                }
            });
        },
        delete: function (context, _id) {
            Meteor.call('players:bookmarks:delete', _id, function (err) {
                if (err) {
                    sAlert.error(err.reason);
                } else {
                    context.commit('removeItem', _id._str);
                }
            });
        }
    },
    getters: {
        categories: function (state) {
            const all = state.collection.map((item) => { return item.category; });
            return _.uniq(all);
        },
        playersIDList: function (state) {
            return state.collection.map((item) => { return item.playerID; });
        }
    }
};

