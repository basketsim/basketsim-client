Meteor.methods({
    updateLive: function(matchId) {
        var userInfoId = Meteor.users.findOne({_id: this.userId}).userInfo_id;
        var userInfo = UserInfo.findOne(userInfoId);
        var live = userInfo.live || [];
        console.log(userInfo);
        console.log('updateLive', matchId);

        if (!_.contains(live, matchId)) {
            live.push(matchId);
            if (live.length > 4) live.shift();
        }
        console.log(live);
        UserInfo.update({_id: userInfoId}, {$set:{live: live}});
    },
    removeLiveMatch: function(matchId) {
        console.log('removeLiveMatch', matchId);
        var userInfoId = Meteor.users.findOne({_id: this.userId}).userInfo_id;
        var userInfo = UserInfo.findOne(userInfoId);
        var live = userInfo.live;

        _.each(live, function(match, index){
            if (matchId === match) {
                live.splice(index, 1);
            }
        });

        UserInfo.update({_id: userInfoId}, {$set:{live: live}});
    },
    addMatchesArray: function(round) {
        var matches = Matches.find({'competition.collection': 'PheonixTrophy', 'competition.stage': 'playoff', 'competition.round':round}, {fields: {_id:true}}).fetch();
        var setter = {};
        var arr = [];
        _.each(matches, function(match){
            arr.push(match._id);
        });

        setter['playoff.round'+round+'.matches'] = arr;
        PheonixTrophy.update({}, {$set:setter});
    }
});
