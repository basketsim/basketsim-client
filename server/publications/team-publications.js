Meteor.publish('team-next-matches', function(){
    if (!this.userId) return this.ready();
    var matches = null;
    var team = pubUtils.getTeam(this);
    var teams = [];
    var user = Meteor.users.findOne({_id:this.userId});
    var userInfo = UserInfo.find({_id:user.userInfo_id});
    matches = Matches.find({
        $or:[
            {'homeTeam.id': team._id},
            {'awayTeam.id': team._id}
        ]
    }, {
        fields:{
            'awayTeam.defensive': false,
            'awayTeam.offensive': false,
            'awayTeam.startingFive': false,
            'awayTeam.subs': false,
            'awayTeam.matchRatings':false,
            'homeTeam.defensive': false,
            'homeTeam.offensive': false,
            'homeTeam.startingFive': false,
            'homeTeam.subs': false,
            'homeTeam.matchRatings':false,
            'matchHistory': false

        }});
    teams = pubUtils.matchesTeamsCursor(matches);

    console.log('team-next-matches, matches found', matches.length);
    return [matches, teams, userInfo];
});

Meteor.publish('team-match-history', function(){
    if (!this.userId) return this.ready();
    var matches = null;
    var team = pubUtils.getTeam(this);
    var teams = [];
    var user = Meteor.users.findOne({_id:this.userId});
    var userInfo = UserInfo.find({_id:user.userInfo_id});
    matches = Matches.find({
        $or:[
            {'homeTeam.id': team._id},
            {'awayTeam.id': team._id}
        ]
    }, {
        fields:{
            'awayTeam.defensive': false,
            'awayTeam.offensive': false,
            'awayTeam.startingFive': false,
            'awayTeam.subs': false,
            'awayTeam.matchRatings':false,
            'homeTeam.defensive': false,
            'homeTeam.offensive': false,
            'homeTeam.startingFive': false,
            'homeTeam.subs': false,
            'homeTeam.matchRatings':false,
            'matchHistory': false

        }});
    teams = pubUtils.matchesTeamsCursor(matches);

    return [matches, teams, userInfo];
});

/**
 * This is using the publishComposite and manages the dependencies per published object
 * It might be a bit easier to use, or at least might provide more usability, so check if this should be used instead of my way
 */
Meteor.publishComposite('matches-opt', function(userInfoId) {
    if (!this.userId) return this.ready();
    var uii = getUserInfoId(userInfoId, this);
    console.log('final uii', uii);
    var team = Teams.getByUserInfoId(uii);

    var matches = Matches.find({
        $or:[
            {'homeTeam.id': team._id},
            {'awayTeam.id': team._id}
        ], 'state.finished':true
    }, {
        fields: Fields.matches.history
    });

    return {
        find: function() {
            return matches;
        },
        children: [
            {
                find: function(match) {
                    return Teams.find({_id: {$in:[match.homeTeam.id, match.awayTeam.id]}}, {fields: Fields.teams.restricted});
                }
            }
        ]
    };
});

/*This is called on before route. Maybe it should be called only when needed or called and saved on session*/
Meteor.publishComposite('own-players', function() {
    if (!this.userId) return this.ready();
    var team = Teams.getByUserid(this.userId);
    var players = Players.find({team_id: team._id}, {fields:{quality:false}});
    return {
        find: function() {
            return players;
        },
        children: [{
            find: function(player) {
                if (player.coach === 9) {
                    return YouthTraining.find({player_id: player._id});
                }
            }
        }]
    };
});

Meteor.publish('full-match', function(matchid){
    var match, fetchedMatch;
    var matchFinal;
    var teams;
    var info = {};

    match = Matches.find({_id: matchid});
    fetchedMatch = match.fetch()[0];
    teams = pubUtils.matchesTeamsCursor(match);

    if (fetchedMatch.dateTime.timestamp - 1800000 > Date.now()) {
        info = matchNotStarted(this, teams, fetchedMatch, matchid);
    } else {
        //(match will start soon)
        info = matchPlayed(this, teams, fetchedMatch, matchid);
        info.match = match;
    }

    return [info.match, teams, info.players];

});

Meteor.publish('own-coach', function(){
    var team = pubUtils.getTeam(this);
    var coach = Players.find({team_id: team._id, coach: 1});

    return coach;
});

Meteor.publish('players', function(userInfoId){
    var uui = getUserInfoId(userInfoId, this);
    var team = Teams.getByUserInfoId(uui);
    var players = Players.find({team_id: team._id, coach:0}, {fields: Fields.players.restricted});
    return players;
});

Meteor.publish('coach', function(userInfoId){
    var uui = getUserInfoId(userInfoId, this);
    var team = Teams.getByUserInfoId(uui);
    var coach = Players.find({team_id: team._id, coach:1});
    return coach;
});

function matchPlayed(self, teams, match, matchid) {
    var positions = ['PG', 'SG', 'SF', 'PF', 'C'];
    var groups = [match.homeTeam.startingFive, match.homeTeam.subs, match.awayTeam.startingFive, match.awayTeam.subs];
    var playerIDS = [];
    var players = [];

    _.each(groups, function(group){
        _.each(positions, function(pos){
            playerIDS.push(group[pos].player_id);
        });
    });

    players = Players.find({_id: {$in: playerIDS}}, {fields: Fields.players.restricted});

    return {
        players: players
    };
}

function matchNotStarted(self, teams, fetchedMatch, matchid) {
    var userId = self.userId;
    var ownTeamObj;
    var players;
    var matchFinal;
    var teamFound = false;
    _.each(teams.fetch(), function(team){
        if (!teamFound) {
            if (isOwnTeam(team._id, userId)) {
                ownTeamObj = team;
                teamFound = true;
            } else {
                ownTeamObj = {
                    _id: {
                        _str: ''
                    }
                };
            }
        }
    });

    console.log('home, away, own', fetchedMatch.homeTeam.id._str, fetchedMatch.awayTeam.id._str, ownTeamObj._id._str);
    if (fetchedMatch.homeTeam.id._str === ownTeamObj._id._str) {
        console.log('home team');
        matchFinal = Matches.find({_id: matchid}, {fields:{
            "awayTeam.startingFive": false,
            "awayTeam.subs": false,
            "awayTeam.offensive": false,
            "awayTeam.defensive": false
        }});
    } else if (fetchedMatch.awayTeam.id._str === ownTeamObj._id._str) {
        console.log('away team');
        matchFinal = Matches.find({_id: matchid}, {fields:{
            "homeTeam.startingFive": false,
            "homeTeam.subs": false,
            "homeTeam.offensive": false,
            "homeTeam.defensive": false
        }});
    } else {
        console.log('no team involved');
        matchFinal = Matches.find({_id: matchid}, {fields:{
            "homeTeam.id": true,
            "awayTeam.id": true,
            state: true,
            dateTime: true
        }});
    }

    players = Players.find({team_id: ownTeamObj._id , coach: 0});

    return {
        players: players,
        match: matchFinal
    };
}

/**
 * Return team based on user rights to see that team
 * @param  {[type]} teamId [description]
 * @return {[type]}        [description]
 */
function getTeam(teamId) {
    var team;
    if (isOwnTeam(teamId, this.userId)) {
        team = Teams.findOne({_id: teamId});
    } else {
        team = Teams.findOne({_id: teamId}, {fields:{
            arena_name: true,
            city: true,
            country: true,
            logo: true,
            name: true,
            short_name: true
        }});
    }
    return team;
}

function isOwnTeam(teamId, userId) {
    var own = Teams.getByUserid(userId);
    console.log('own team', own._id._str, teamId._str);

    if (own._id._str === teamId._str) {
        console.log('isOwnTeam return true', own._id._str);
        return true;
    } else {
        return false;
    }
}
/**
 * If uii is defined, simply return it
 * If not defined, return the uii of the logged in user
 * @param  {[type]} uii UserInfoId
 * @return {[type]}     [description]
 */
function getUserInfoId(uii, self) {
    if (uii) return new Mongo.ObjectID(uii) ;
    console.log(self.userId);
    var user = Meteor.users.findOne({_id: self.userId});
    return user.userInfo_id;
}

