import BookmarksList from './../../../players/client/containers/BookmarksList';
import Vue from 'vue/dist/vue.common';

export default (el) => {
    return new Vue({
        el: el,
        components: {
            'bookmarks-list': BookmarksList
        },
        template: `
            <bookmarks-list></bookmarks-list>
        `
    });
};