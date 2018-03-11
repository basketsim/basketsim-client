import utils from './../../../utils/client/api';
export default {
    props: ['bookmarks', 'categories', 'players'],
    created: function () {
    },
    data: function () {
        return {
            categoryFilter: ''
        };
    },
    computed: {
        filteredBookmarks: function () {
            if (!this.categoryFilter) return this.bookmarks;
            return this.bookmarks.filter((item) => {return item.category === this.categoryFilter; });
        }
    },
    methods: {
        decodeHtml: function (html) {
            return utils.general.decodeHtml(html);
        },
        playerOnSale: function (playerIDStr) {
            const player = this.players.find((item) => {
                return item._id._str === playerIDStr;
            });
            if (!player) return false;
            return player.transfer_id ? true : false;
        },
        onSaleTitle: function (playerName) {
            return this.decodeHtml(playerName)+ ' is on sale';
        }
    },
    template: `
        <div class="card white bookmark-list">
            <div class="card-header blue">
              <h4>Bookmarks</h4>
              <div>
                <button v-on:click="categoryFilter = ''" type="button" class="btn btn-link">All</button>
                <button v-on:click="categoryFilter = category" v-for="category in categories" type="button" class="btn btn-link">{{category}}</button>
              </div>
            </div>
            <div class="card-content">
              <a v-for="bookmark in filteredBookmarks" :href="'/players/'+ bookmark.playerID._str">
                <span :title="bookmark.playerOnSale ? onSaleTitle(bookmark.playerName) : null " class="player-name">
                  {{decodeHtml(bookmark.playerName)}}
                  <span v-if="bookmark.playerOnSale" style="color: #00c700"> $</span>
                </span>
              </a>
            </div>
        </div>
    `
};