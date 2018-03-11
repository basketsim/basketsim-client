/**
 * Summer trophy info
 * 8 teams per group
 * 14 matches in total
 * 4 matches/week - Monday, Wednesday, Saturday , but consider different days/hours for better distribution of servel load
 * 4 weeks
 * Will be 3 teams that qualify from most of the groups -> roughly 2048 teams qualified, so 11 playoff rounds
 * 4/4/3 - 3 more weeks for playoffs
 * Total: 6 weeks + 1-2 weeks before for friendlies
 */

var chance = new Chance();
var bst = bst || {};
var currentSeason = 0;
var competitionRules = {
    groupSize: 8,
    inPlayoff: 2048,
    playingDates: {
        group: {
            // ['Sunday', 'Tuesday', 'Thursday', 'Saturday']
            days: [4, 6, 0, 2],
            times: 'HOST'
        },
        playoff: {
            // ['Monday', 'Wednesday', 'Saturday']
            days: [1, 3, 6],
            times: 'HOST'
        }
    }
};

Meteor.methods({
    'newStSeason': function () {
        newSeason();
    },
    // 'promoteToPlayoff': playoff.create(2048)
    promoteToPlayoff: function(teamNum) {
        competitions.pheonix.playoff.create(teamNum);
    }
});

function newSeason() {
    var season = {};
    var teams = [];
    var promotedTeams = [];
    var pairedForPlayoff = [];
    var seasonNum = getCurrentEdition();


    teams = getTeams();
    // promotedTeams = promoteToPlayoff(groups, 2048);
    // pairedForPlayoff = setRandomPairs(promotedTeams, true);
    var groups = fillGroups(teams, 8, seasonNum);

    season = {
        edition: seasonNum,
        groups: groups,
        playoff: {},
        state: {
            teamsPerGroup: 8,
            playoffTeams: 2048,
            stage: 'group',
            nextRound: 1,
            started: false,
            ended: false
        },
        startDate: DateUtils.startDate(null, competitionRules.playingDates.group.days[0])
    };
    // insertSeason(season, seasonNum);
    currentSeason = seasonNum;
    PheonixTrophy.insert(season, function(succ, err){
        generateGroupMatches(groups);
    });


    console.log('done generating matches');
}

// function isSeasonCreated() {
//     var st = GlobalCompetitions.find({name: "Basketsim Summer Trophy"}).fetch();
//     if (st['season'+st.currentSeason] === undefined) {
//         return false;
//     } else {
//         return true;
//     }
// }
// function canCreateNewSeason() {
//     var st = GlobalCompetitions.findOne({name: "Basketsim Summer Trophy"});
//     if (st['season'+st.currentSeason] === undefined) return true;

//     if (st['season'+st.currentSeason].state.ended) {
//         return true;
//     } else {
//         return false;
//     }
// }

function getCurrentEdition() {
    var edition;
    var result = PheonixTrophy.find({}, {sort: {edition: -1}}, {fields:{edition:true}}).fetch()[0];
    if (result) {
        edition = result.edition + 1;
    } else {
        edition = 1;
    }

    return edition;
}
function insertSeason(season, edition) {
    season.edition = edition;
    PheonixTrophy.insert(season, function(succ, err){
        console.log('succ: ', succ, 'err: ', err);
    });
}

function generateGroupMatches(groups) {
    var iterator = 0;
    var competition = PheonixTrophy.findOne({edition:currentSeason});
    var competitionInfo = {
        collection: 'PheonixTrophy',
        id: competition._id,
        type: 'PheonixTrophy',
        season: competition.edition,
        arenaLocation: 'Home',
        stage: competition.state.stage,
        startDate: competition.startDate
    };

    for (var groupKey in groups) {
        console.log('group', iterator, ' starts');
        iterator ++;
        competitionInfo.groupNumber = groups[groupKey].index;
        CompUtils.generateGroupMatches(groups[groupKey].teams, competitionInfo, competitionRules);
    }

    PheonixTrophy.update({_id: competition._id}, {$set:{
        started:true
    }});
}

function getTeams() {
    var users = [];
    var teamIds = [];
    var teams = [];
    users = UserInfo.find().fetch();
    _.each(users, function(user){
        teamIds.push(user.team_id);
    });

    teams = Teams.find({_id: {$in:teamIds}}, {fields:{_id:true}}).fetch();

    return teams;
}

function fillGroups(teams, teamsPerGroup, seasonNum) {
    var teamsInGroups = 0;
    var groups = partitionGroups(teams, teamsPerGroup);
    var randomTeams = chance.shuffle(teams);
    var iterator = 0;

    for(var groupKey in groups) {
        _.each(groups[groupKey].teams, function(team, index){
            groups[groupKey].teams[index]= genTeamModel(randomTeams[iterator]._id);
            updateTeamComp(randomTeams[iterator]._id, seasonNum, groups[groupKey].index);
            iterator++;
        });
    }

    return groups;
}

function updateTeamComp(team_id, seasonNum, groupIndex) {
    Teams.update({_id: team_id}, {$set:{
        'competitions.phoenixCup': {
            season: seasonNum,
            group: groupIndex
        }
    }});
}

function genTeamModel(team_id) {
    var team = {
        _id: team_id,
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
        scoredPoints: 0,
        againstPoints: 0,
        pointsDifference: 0,
        winPercentage:0,
        pointsPercentage: 0
    };

    return team;
}
/**
 * Based on number of teams and how many there should be per group, calculate the number of groups needed and
 * distribute teams evenly, so there is no group with way less teams
 * @param  {array} teams         Array of teams
 * @param  {number} teamsPerGroup Number of teams in each group
 * @return {array}               Array of groups, containing empty array of teams, with set lengths, that can be filled with real data
 */
function partitionGroups(teams, teamsPerGroup) {
    var groupSize = teamsPerGroup;
    var totalTeams = teams.length;
    var remains = teams.length % groupSize;
    var noOfGroups = 0;
    var smallerGroups = 0;
    var groups = {};

    //now total teams can be split perfectly to group size
    totalTeams = totalTeams - remains;

    if (remains === 0) {
        noOfGroups = totalTeams/groupSize;
    } else {
        noOfGroups = totalTeams/groupSize + 1;
        smallerGroups = teamsPerGroup - remains;
    }

    for (var i=0; i<noOfGroups; i++) {
        if (i >= noOfGroups-smallerGroups) {
            groups['g'+i] = {
                teams: fillArray(teamsPerGroup - 1, {}),
                index: i
            };
        } else {
            groups['g'+i] = {
                teams: fillArray(teamsPerGroup, {}),
                index: i
            };
        }
    }

    return groups;
}

function setRandomPairs(teamsList, shuffleTeams) {
    var teams = [];
    var pairs = [];
    var pairList= [];
    var pair = {};

    if (shuffleTeams) {
        teams = chance.shuffle(teamsList);
    } else {
        teams = teamsList;
    }

    for (var i=0; i<teams.length; i=i+2) {
        pairList = chance.shuffle([teams[i], teams[i+1]]);
        pair = {
            homeTeam: pairList[0],
            awayTeam: pairList[1]
        };
        pairs.push(pair);
    }

    return pairs;
}
/**
 * Generated and Array with a number of same elements
 * @param  {integer} number  Length of array
 * @param  {any type} element Element to be inserted multiple times
 * @return {array}         Populated array
 */
function fillArray(number, element) {
    var arr = [];
    for (var i=0; i<number; i++) {
        arr.push(element);
    }

    return arr;
}

bst.BasketsimSummerTrophy = {
    partitionGroups: partitionGroups
};
