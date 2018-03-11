import players from './../../../players/server/api.js';
import finances from './../../../finances/server/api.js';
import financeModel from './../../../finances/server/models/finance-model.js';


function updates() {
    var api = {updateMatch, objDifference, setState, trainingListUpdate, concatenateTrainingLists, scoreDifference, _updateExperience};

    function updateMatch(match) {
        var league = Leagues.findOne({_id: match.competition._id});

        setFinished(match);
        updateTeams(match, league);
        updateTraining(match);
        api._updateExperience(match);
        updateLeague(league);
        updateAttendanceMoney(match);
    }

    function cleanLeague(league) {
        var teams = [];
        var currTeams = league.seasons[23].teams;
        var state = {
            round: 3,
            matchesPlayed: 0,
            regularEnded: false
        };

        _.each(currTeams, function(team){
            teams.push(teamInLeague(team._id, team.name));
        });

        Leagues.update({_id: league._id}, {$set:{
            'seasons.23.teams': teams,
            'seasons.23.state': state
        }});
    }

    /**
     * For each league, add the score difference to every team.
     * Do this on season end
     */
    function scoreDifference() {
        var cs = GameInfo.findOne().season;
        var leagues = Leagues.find({});
        // var leagues = Leagues.find({_id: new Mongo.ObjectID('55cf04f11cc5f84ae61f0996')});

        var length = leagues.count();
        leagues.forEach(function (league, i) {
            if (league.seasons[cs]) {
                let setter = {};
                let teams = league.seasons[cs].teams;

                _.each(teams, function(team){
                    team.difference = team.scored - team.against;
                });

                setter['seasons.'+cs] = {};
                setter['seasons.'+cs]['teams'] = teams;

                Leagues.update({_id: league._id}, {$set: setter});
            }
            console.log('difference updated', i+1, '/', length);
        });
        console.log('score difference end');
    }

    /**
     * Set league as finished. Should be done on end of season, automatically
     */
    function setState() {
        var cs = GameInfo.findOne().season;
        var leagues = Leagues.find({});
        var length = leagues.count();

        leagues.forEach(function (league, i) {
            Leagues.update({_id: league._id}, {$set:{
                ['seasons.' +cs + '.state']: {
                    round:27,
                    matchesPlayed: 0,
                    regularEnded: true
                }
            }});
            console.log('set state updated', i+1, '/', length);
        });
    }

    function addMatches(league) {
        var matches = Matches.find({'competition._id':league._id, 'competition.round':{$lt: 4}}).fetch();
        _.each(matches, function(match){
            updateTeams(match, league);
        });
    }

    function teamInLeague(teamid, name) {
        return {
            _id: teamid,
            team_id: teamid,
            name: name,
            season: 23,
            position: 1,
            played: 0,
            win: 0,
            lose: 0,
            scored: 0,
            against: 0,
            difference: 0,
            lastpos: 1
        }
    }

    function updateTeams(match, league) {
        var teams = league.seasons[league.currentSeason].teams;
        //iterate over all teams in the league and update the one involved in the current match
        _.each(teams, function(team){
            if (team._id._str === match.homeTeam.id._str) {
                updateTeam(match, league, 'homeTeam', team);
            } else if (team._id._str === match.awayTeam.id._str) {
                updateTeam(match, league, 'awayTeam', team);
            }
        });
    }
    /**
     * NEED TO UPDATE ROUND EARLY ON MONDAY
     */
    function updateLeague(league) {
        var state = league.seasons[league.currentSeason].state;
        var matchesPlayed = state.matchesPlayed;
        var round = state.round;
        var regularEnded = false;
        var setter = {};
        var currentSeason = league.currentSeason;

        matchesPlayed++;

        if (matchesPlayed === 7) {
            round++;
            matchesPlayed = 0;
        }

        if (round === 27) {
            regularEnded = true;
        }

        setter['seasons.'+currentSeason+'.state.round'] = round;
        setter['seasons.'+currentSeason+'.state.matchesPlayed'] = matchesPlayed;
        setter['seasons.'+currentSeason+'.state.regularEnded'] = regularEnded;


        Leagues.update({_id: league._id}, {$set: setter});
    }

    function updateTeam(match, league, whichTeam, team) {
        var opposingTeam = getOpposingTeam(whichTeam);
        var currentSeason = league.currentSeason;
        var winner = getWinner(match);

        //check if current team is winning team
        if (whichTeam === winner) {
            team.win ++;
        } else {
            team.lose ++;
        }

        team.played ++;
        team.scored += match[whichTeam].matchRatings.score;
        team.against += match[opposingTeam].matchRatings.score;

        insertTeamUpdate(match.competition._id, currentSeason, team);
    }

    function insertTeamUpdate(leagueId, currentSeason, team) {
        var update = {
            _id: leagueId
        };
        var setter = {};

        update['seasons.'+currentSeason+'.teams._id'] = team._id;
        setter['seasons.'+currentSeason+'.teams.$'] = team;

        Leagues.update(update, {
            $set:setter
        });
    }

    function updateTraining(match) {
        var teams = [match.homeTeam, match.awayTeam];
        _.each(teams, function(team){
            trainingListUpdate(team);
        });
    }

    /**
     * Updates experience of all starting five players involved in the match by delegatin to the players module
     */
    function _updateExperience(match) {
        players.experience.add(match);
    }

    /**
     * Get guards and big men from starting five
     * Get the training of the team collection
     * Manage training list to contain right players
     * Update training lists
     */
    function trainingListUpdate(team) {
        if (!team.startingFive) return;
        var guards = [team.startingFive.PG.player_id, team.startingFive.SG.player_id],
        bigMen = [team.startingFive.SF.player_id, team.startingFive.PF.player_id, team.startingFive.C.player_id],
        teamColl = Teams.findOne({_id: team.id});

        var currentTraining = teamColl.training;

        if (currentTraining) {
            currentTraining = api.concatenateTrainingLists(currentTraining, guards, bigMen);

            Teams.update({_id: teamColl._id}, {$set:{
                'training.guards.players': currentTraining.guards.players,
                'training.bigMen.players': currentTraining.bigMen.players
            }});
        }
    }

    /**
     * Remove new training players from the guards and big men group
     * Add new guards to guards and new big men to big men in the training object
     */
    function concatenateTrainingLists(currentTraining, guards, bigMen) {
        var allPlayers = guards.concat(bigMen);

        //remove common players
        currentTraining.guards.players = api.objDifference(currentTraining.guards.players, allPlayers);
        currentTraining.bigMen.players = api.objDifference(currentTraining.bigMen.players, allPlayers);

        //add new players to training
        currentTraining.guards.players = currentTraining.guards.players.concat(guards);
        currentTraining.bigMen.players = currentTraining.bigMen.players.concat(bigMen);

        return currentTraining;
    }

    function updateAttendanceMoney(match) {
        var income = 0;
        var att = match.attendance;
        var homeTeam_id = match.homeTeam.id;
        //revenue per seat
        var rps = {
            cs: 15,
            ce: 20,
            ul: 20,
            vip: 100
        };

        income = att.courtSide * rps.cs + att.courtEnd * rps.ce + att.upperLevel * rps.ul + att.vip * rps.vip;

        if (income) {
            Teams.update({_id: homeTeam_id}, {$inc:{curmoney: income}}, function(){
                finances.spending.update(homeTeam_id);
                financeModel.logAttendanceIncome(homeTeam_id, income);
            });
        }
    }

    function tiredness(match) {

    }

    function stats(match) {

    }

    /**
     * Returns the objects that are in first, but not in second
     * EX: first = [a,b,c] second = [b,d,f]
     *     result = [a,c];
     */
    function objDifference(first, second) {
        var players = [];
        _.each(second, function(player){
            if (player) {
                players.push(player)
            }
        });

        return _.filter(first, function(obj){ return !_.findWhere(players, obj); });
    }

    function containsObject(listOfObj, obj) {
        var elements = [];
        elements = _.where(listOfObj, obj);
        if (elements[0]) {
            return true;
        } else {
            return false;
        }
    }

    function setFinished(match) {
        Matches.update({_id: match._id}, {$set:{'state.finished':true}});
    }

    function getOpposingTeam(whichTeam) {
        var opposingTeam = '';

        if (whichTeam === 'homeTeam') {
            opposingTeam = 'awayTeam';
        } else {
            opposingTeam = 'homeTeam';
        }

        return opposingTeam;
    }

    function getWinner(match) {
        var winner = '';

        if (match.homeTeam.matchRatings.score > match.awayTeam.matchRatings.score) {
            winner = 'homeTeam';
        } else {
            winner = 'awayTeam';
        }

        return winner;
    }

    return api;
}

export default updates();


