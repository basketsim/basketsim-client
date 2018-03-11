import {store, a, g} from './../../../store/client/store';
import Bookmark from './../components/Bookmark';
import RemoveBookark from './../components/RemoveBookmark';
import {sAlert} from 'meteor/juliancwirko:s-alert';
import Vue from 'vue/dist/vue.common';

const bookmark = (el) => {
    return new Vue({
        el: el,
        created: function() {
            store.dispatch(a.bookmarks.BOOKMARKS_FETCH, {});
        },
        computed: {
            playerID() {
                return store.state.players.selectedID;
            },
            categories() {
                return store.getters[g.bookmarks.CATEGORIES];
            },
            currBookmark() {
                return store.state.bookmarks.collection.find((item) => {
                    return item.playerID._str === this.playerID;
                });
            },
            isBookmarked() {
                const bk = this.currBookmark;
                return bk ? true : false;
            }
        },
        components: {
            'bookmark': Bookmark,
            'remove-bookmark': RemoveBookark
        },
        methods: {
            addBookmark: addBookmark,
            removeBookmark: removeBookmark
        },
        template: `
          <remove-bookmark v-if="isBookmarked" :_id="currBookmark._id" :category="currBookmark.category" :removeBookmark="removeBookmark"></remove-bookmark>
          <bookmark v-else :playerID="playerID" :addBookmark="addBookmark" :categories="categories"></bookmark>
        `
    });
};

function addBookmark(playerID, category) {
    if (!category || category.length > 24) {
        sAlert.error('Please specify a bookmark category that is shorter than 24 characters');
        return;
    }
    store.dispatch(a.bookmarks.BOOKMARKS_INSERT, {playerID, category});
}

function removeBookmark(_id) {
    store.dispatch(a.bookmarks.BOOKMARKS_DELETE, _id);
}

export default bookmark;