import news from './../../news/server/api.js'
function youth() {
    var api = {allowNewPulls};

    function allowNewPulls() {
        news.admin.allowNewPullsStarted();

        Teams.update({}, {$set:{canPullYouth:true}}, {multi:true});

        news.admin.allowNewPullsEnded();
    }

    return api;
}

export default youth();