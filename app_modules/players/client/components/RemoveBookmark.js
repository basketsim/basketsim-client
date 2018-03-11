export default {
    props: ['_id', 'category', 'removeBookmark'],
    template: `
        <button v-on:click="removeBookmark(_id)" type="button" class="bookmark-btn" title="Remove Bookmark">
          <span><span style="font-size: 14px; vertical-align: top;" class="ion-android-star"></span> {{category}} - Remove</span>
        </button>
    `
};