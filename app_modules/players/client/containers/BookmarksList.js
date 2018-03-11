import {store, a, g} from './../../../store/client/store';
import BookmarksView from './../components/BookmarksList';
export default {
    created: function () {
        store.dispatch(a.bookmarks.BOOKMARKS_FETCH);
    },
    computed: {
        categories: function () {
            return store.getters[g.bookmarks.CATEGORIES];
        },
        bookmarks: function () {
            return store.state.bookmarks.collection;
        },
        players: function () {
            return store.state.players.collection;
        }
    },
    components: {
        'bookmarks-list': BookmarksView
    },
    template: `
      <bookmarks-list :bookmarks="bookmarks" :categories="categories" :players="players"></bookmarks-list>
    `
};