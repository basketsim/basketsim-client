Meteor.publish('live', function(){
    var liveMatchTemplate = {
            _id: 'id',
            info: {},
            matchHistory: {},
            matchStarted: true,
            matchFinished: false
        };
    var userInfo = pubUtils.getUserInfo(this);
    var liveSelection = userInfo.fetch()[0].live;
    var matchesCursor = Matches.find({_id: {$in: liveSelection}});
    var pubMatches = Matches.find({_id: {$in: liveSelection}}, {fields: {
        // matchHistory:false,
        'homeTeam.id':true,
        'awayTeam.id':true
    }});

    var allMatches = matchesCursor.fetch(),
    playingMatches = getPlayingMatches(allMatches, this),
    self = this,
    interval,
    time = Date.now();

    start(allMatches, this);
    playByPlay(playingMatches, this);

    self.onStop(function(){
        clearInterval(interval);
    });

    //get teams
    var teamCursors = pubUtils.matchesTeamsCursor(matchesCursor);
    var teams = teamCursors.fetch();
    var teamids = [];
    _.each(teams, function(team){
        teamids.push(team._id);
    });
    var playerCursors = Players.getByTeamIds(teamids, 'RESTRICTED');

    return [userInfo, pubMatches, teamCursors, playerCursors];
});

//this might be needed only for the interval
function getPlayingMatches(allMatches) {
    var playing = [];
    _.each(allMatches, function(match, i){
        if (match.state.simulated === true && match.state.finished === false) {
            playing.push(match);
        }
    });

    return playing;
}

function start(allMatches, pub) {
    var live = [];
    var liveMatch = {};

    _.each(allMatches, function(match, i){
        liveMatch = {};
        liveMatch._id = match._id;
        if (match.state.simulated === false) {
            liveMatch.matchStarted = false;
        } else {
            liveMatch.matchStarted = true;
            liveMatch.info = getHistory(match).info;
            liveMatch.matchHistory = getHistory(match).matchHistory;
        }
        live.push(liveMatch);
    });

    _.each(live, function(match){
        pub.added('live-matches', match._id, match);
    });

}

function playByPlay(playingMatches, pub) {
    var playing = playingMatches;
    var difference;
    var live = [];
    var liveMatch = {};

    var interval = setInterval(function(){
        var time = Date.now();
        var live = [];
        //clear interval if playing is empty
        if (playing.length === 0) {
            clearInterval(interval);
            return;
        }

        _.each(playing, function(match, i){
            liveMatch = {};
            liveMatch._id = match._id;
            liveMatch.info = getHistory(match).info;
            liveMatch.matchHistory = getHistory(match).matchHistory;
            live.push(liveMatch);

            //check if match finished
            if (match.state.finished) {
                playing.splice(i,1);
            }
        });

        _.each(live, function(match){
            pub.changed('live-matches', match._id, match);
        });
    }, 8000);
}

function getHistory(match) {
    var time = Date.now();
    var liveMatch = {
        matchHistory: {}
    };
    var difference = time - match.dateTime.timestamp;
    for (var hist in match.matchHistory) {
        if (difference > match.matchHistory[hist].time*1000) {
            liveMatch.matchHistory[hist] = match.matchHistory[hist];
        }
        if (match.matchHistory.archived) {
            liveMatch.matchHistory = {
                archived: true
            };
        } else if (difference > match.matchHistory.info.totalTime*1000) {
            liveMatch.matchFinished = true;
        }
    }

    return {
        matchHistory: liveMatch.matchHistory
    };
}