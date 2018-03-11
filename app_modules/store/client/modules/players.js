import pushOrReplace from './../helpers/pushOrReplace';
import { Meteor } from 'meteor/meteor';
export default {
    namespaced: true,
    state: {
        collection: [],
        selectedID: ''
    },
    mutations: {
        selectedID (state, id) {
            state.selectedID = id;
        },
        collectionMerge: function (state, newItems) {
            state.collection = pushOrReplace(state.collection, newItems, '_id._str');
        },
        collectionReplace: function (state, newItems) {
            state.collection = newItems;
        }
    },
    actions: {
        fetch: function (context, query) {
          Meteor.call('GET:players', query, function (err, players) {
            if (!err) {
              context.commit('collectionReplace', players);
            } else {
              sAlert.error(err.reason);
            }
          });
        }
    }
};