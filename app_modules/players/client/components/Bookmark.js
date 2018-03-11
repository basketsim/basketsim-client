export default {
        props: ['playerID', 'addBookmark', 'categories'],
        created: () => {
        },
        data: () => {
            return {
                category:''
            };
        },
        template: `
          <div class="btn-group" style="margin-bottom: 10px;">
            <button type="button" class="dropdown-toggle bookmark-btn" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              <span>Bookmark</span>
            </button>
            <ul class="dropdown-menu blue" style="width: 200px; left: -120px;">
              <li v-for="cat in categories"><button v-on:click="addBookmark(playerID, cat)" type="button" class="btn btn-link">{{cat}}</button></li>
              <li role="separator" class="divider"></li>
              <li style="color: orange; margin-left: 20px;">
                <span>Add New Category:</span>
                <div>
                  <input v-model="category" style="color:black" title="Enter name of new bookmark" type="text" placeholder="New Bookmark">
                  <div style="font-size: 24px;margin-left: 6px;display: inline-block;vertical-align: middle;"><button v-on:click="addBookmark(playerID, category)" title="Add Bookmark" class="btn-icon ion-plus-circled"></button></div>
                </div>
              </li>
            </ul>
          </div>
        `
};
