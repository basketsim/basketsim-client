Template.Live.helpers({
    // 'matchEvents': function () {
    //     var evts = [];
    //     if (this.matchHistory === undefined) {
    //         return ['Match has not been played'];
    //     }
    //     for (var matchEvent in this.matchHistory) {
    //         if (this.matchHistory[matchEvent].commentary === undefined) {

    //         } else {
    //             evts.push(formatEvent(this.matchHistory[matchEvent], this._id));
    //             evts = evts.slice(-8);
    //         }
    //     }
    //     return evts;
    // },
    'matchEvents': function (slicer) {
        var template = Template.instance();
        var evts = [];
        var match = LiveMatches.findOne({_id: this._id});
        if (match.matchHistory === undefined) {
            return ['Match has not been played'];
        } else if (match.matchHistory.archived){
            return ['Match commentary was archived'];
        }
        for (var matchEvent in match.matchHistory) {
            if (match.matchHistory[matchEvent].commentary === undefined) {

            } else {
                evts.push(formatEvent(match.matchHistory[matchEvent], match._id));
                if (slicer) evts = evts.slice(-8);
            }
        }

        // $('.live-text').animate({scrollTop: 10000}, 3000);
        return evts;
    },
    reactiveLive: function() {
        return Session.get('live-matches');
    },
    teamNames: function() {
        var match = Matches.findOne(this._id);
        if (!match) return '';
        var homeTeam = Teams.findOne(match.homeTeam.id);
        var awayTeam = Teams.findOne(match.awayTeam.id);

        return homeTeam.name + ' - ' + awayTeam.name;
    }
});
Template.Live.events({
    'click a.remove-live': function() {
        var id = this._id;
        Meteor.call('removeLiveMatch', this._id, function(){
            updateLiveMatches();
        });
    },
    'click a.full-commentary': function(evt) {
        evt.preventDefault();
        $('#match-'+ this._id).modal();
    }
});

Template.Live.onRendered(function(){
    updateLiveMatches();

});

function formatEvent(mevent, match_id) {
    var finalEvent = mevent.commentary;
    if (finalEvent.indexOf("{{att.hero}}") !== -1) {
        finalEvent = finalEvent.replace(/{{att.hero}}/g, getPlayerName(mevent, 'att', 'hero'));
    }
    if(finalEvent.indexOf("{{def.hero}}") !== -1) {
        finalEvent = finalEvent.replace(/{{def.hero}}/g, getPlayerName(mevent, 'def', 'hero'));
    }
    if(finalEvent.indexOf("{{att.sidekick}}") !== -1) {
        finalEvent = finalEvent.replace(/{{att.sidekick}}/g, getPlayerName(mevent, 'att', 'sideKick'));
    }
    if(finalEvent.indexOf("{{def.sidekick}}") !== -1) {
        finalEvent = finalEvent.replace(/{{def.sidekick}}/g, getPlayerName(mevent, 'def', 'sideKick'));
    }
    if(finalEvent.indexOf("{{att.team}}") !== -1) {
        finalEvent = finalEvent.replace(/{{att.team}}/g, getTeamName(mevent, 'att', match_id));
    }
    if(finalEvent.indexOf("{{def.team}}") !== -1) {
        finalEvent = finalEvent.replace(/{{def.team}}/g, getTeamName(mevent, 'def', match_id));
    }
    if(finalEvent.indexOf("{{rated.team}}") !== -1) {
        finalEvent = finalEvent.replace(/{{rated.team}}/g, getTeamName(mevent, 'rated', match_id));
    }
    if(finalEvent.indexOf("{{home.score}}") !== -1) {
        finalEvent = finalEvent.replace(/{{home.score}}/g, getEventScore(mevent, 'home'));
    }
    if(finalEvent.indexOf("{{away.score}}") !== -1) {
        finalEvent = finalEvent.replace(/{{away.score}}/g, getEventScore(mevent, 'away'));
    }
    //add time
    finalEvent = displayEvent(mevent, finalEvent);
    return finalEvent;
}

function displayEvent(mevent, formattedEvent) {
    if (mevent.type === 'end' || mevent.type === 'extratime' || mevent.type === 'quarterbreak' || mevent.type === 'halftime') {
        return formattedEvent;
    } else {
        return 'Min ' + getTime(mevent.time) + ': ' + formattedEvent;
    }
}

function getTime(time) {
    var rtime = parseInt(time/60);
    if (rtime < 10) {
        rtime = rtime;
    } else if (rtime > 10 && rtime <= 22){
        rtime = rtime - 2;
    } else if (rtime > 22 && rtime <= 37){
        rtime = rtime - 7;
    } else if (rtime > 37) {
        rtime = rtime - 9;
    } else if (rtime >= 46) {
        rtime = 40;
    }

    return rtime;
}

function getPlayerName(mevent, side, role) {
    var playerid = mevent[side][role+'_id'];
    var player = Players.findOne({'_id': playerid});
    if (player) {
        return player.name + ' ' + player.surname;
    } else {
        return side + 'player';
    }
}

function getTeamName(mevent, side, match_id) {
    var match = Matches.findOne({_id:match_id});
    var which = mevent[side].which;
    var team_id = match[which].id;
    var name = Teams.findOne({_id:team_id}).name;
    return name;
}

function getEventScore(mevent, side) {
    return mevent.score[side];
}

function updateLiveMatches() {
    if (!UserInfo.findOne(Meteor.user().userInfo_id)) return;
    var liveIds = UserInfo.findOne(Meteor.user().userInfo_id).live;

    var actualMatches = LiveMatches.find({_id:{$in:liveIds}}).fetch();

    Session.set('live-matches', actualMatches);
}