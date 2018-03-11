import { Mongo } from 'meteor/mongo';
import teamModel from './../../../../teams/server/model.js';
import _ from 'underscore';
import Leagues from './../../../../../collections/Leagues.js';

function model() {
    var api = {getMinLeagueLevel, isLeagueActive, getBotTeams, sortTeamsByStanding, bestOnPlace, bestOnPlaceExcluding, teamOnPlace, getSeasonsContainingTeams,
        teamPosition, bestFromTeamsList, teamsToStrings, createLeagueTeam, isLevelActive, teamsFromLeagues, getMinActiveLevel, emptySeason};

    function getMinLeagueLevel(leagues, currSeason) {
        var minLevel = 1;

        _.each(leagues, function(league){
            if (league.level > minLevel && api.isLeagueActive(league, currSeason)) {
                minLevel = league.level;
            }
        });

        return minLevel;
    }

    /**
     * Taking an array of leagues, return the minimum level that has all leagues populated with teams, and at least one of those has an active owner
     * @return {number}            Min active level number
     */
    function getMinActiveLevel(leagues, currSeason) {
        var minLevel = 1;

        _.each(leagues, function(league){
            if (league.level > minLevel && api.isLeagueActive(league, currSeason)) {
                minLevel = league.level;
            }
        });

        for (var i = minLevel; i > 0; i--) {
            if (api.isLevelActive(leagues, i, currSeason)) {
                minLevel = i;
                break;
            }
        }

        return minLevel;
    }

    /**
     * Check if the leagues of a specific level are active (have any active players inside);
     * First check if all leagues are defined properly and have teams for the current season
     * Then check if there is at least one team with an existing owner.
     * @param  {[type]}  leagues    [description]
     * @param  {[type]}  level      [description]
     * @param  {[type]}  currSeason [description]
     * @return {Boolean}            [description]
     */
    function isLevelActive(leagues, level, currSeason) {
        var lowLevelLeagues = [],
            bots = [],
            teams = [];
        leagues = _.where(leagues, {level: level});
        for (var i=0; i< leagues.length; i++) {
            if (!api.isLeagueActive(leagues[i], currSeason)) {
                return false;
            }
        }

        lowLevelLeagues = _.where(leagues, {level: level});
        lowLevelLeagues.forEach(function (league) {
            league.seasons[currSeason].teams.forEach(function (team) {
                teams.push(team.team_id._str);
            });
        });

        bots = teamModel.botsInList(teams);

        if (_.difference(teams, bots).length === 0) {
            return false;
        } else {
            return true;
        }
    }

    /**
     * [sortTeamsByStanding description]
     * @param  {[type]} season [description]
     * @return {[type]}        [description]
     */
    function sortTeamsByStanding(season) {
        var teams = _.sortBy(_.sortBy(_.sortBy(season.teams, 'scored'), 'difference'), 'win').reverse();
        return teams;
    }

    function isLeagueActive(league, currSeason) {
        if (league.seasons[currSeason] && league.seasons[currSeason].teams[0]) return true;
        return false;
    }

    /**
     * [getBotTeams description]
     * @param  {[type]} leagues  [description]
     * @param  {[type]} minLevel [description]
     * @param  {[type]} season   [description]
     * @return {array/strings}           List of teamIDs as strings
     */
    function getBotTeams(leagues, minLevel, season) {
        var teams = [];
        var team_ids = [];
        var tid_str = [];
        var active_ids = [];
        var botTeams = [], botTeams_ids = [];
        for (var i=1; i<=minLevel; i++) {
            _.each(leagues, function(league){
                if (league.level === i) {
                    teams = league.seasons[season].teams;
                    _.each(teams, function(team){
                        team_ids.push(team.team_id);
                    });
                }
            });
        }

        var active = UserInfo.find({team_id: {$in: team_ids}}, {fields:{team_id:true}}).fetch();
        //All active teams _str
        _.each(active, function(userinfo){
            active_ids.push(userinfo.team_id._str);
        });
        //All teams teams _str
        _.each(team_ids, function(team_id){
            tid_str.push(team_id._str);
        });

        //All bot/inactive teams _str
        botTeams = _.difference(tid_str, active_ids);
        return botTeams;
    }

    /**
     * Pass a season object and get the team on a specified place
     * @param  {[type]} place     [description]
     * @param  {[type]} seasonObj [description]
     * @return {[type]}           [description]
     */
    function teamOnPlace(place, seasonObj) {
        var teams = _.sortBy(_.sortBy(_.sortBy(seasonObj.teams, 'scored'), 'difference'), 'win').reverse();
        return teams[place - 1];
    }

    function teamPosition(teamID, cs, leagueID) {
        var teamPosition = 1;
        var league = Leagues.findOne({_id: leagueID}, {fields: { [`seasons.${cs}.teams`]:1 }});
        var teams = league.seasons[cs].teams;
        teams = _.sortBy(_.sortBy(_.sortBy(teams, 'scored'), 'difference'), 'win').reverse();

        teams.forEach(function (team, i) {
            if (teamID._str === team.team_id._str) teamPosition = i + 1;
        });

        return teamPosition;
    }

    /**
     * Get the ids of first numTeams occupying a specific place in a list of seasons
     * @param  {number} numTeams    How many to return
     * @param  {number} place       Position occupied
     * @param  {array} seasonsList  List of seasons
     * @return {[type]}             [description]
     */
    function bestOnPlace(numTeams, place, seasonsList) {
        var teamsList = seasonsList.map(function(season){
            let standings = api.sortTeamsByStanding(season);
            return standings[place-1];
        });

        var teams = api.bestFromTeamsList(numTeams, teamsList);

        return teams;
    }

    function bestOnPlaceExcluding(numTeams, place, seasonsList, excluded) {
        var teamsList = seasonsList.map(function(season){
            let standings = api.sortTeamsByStanding(season);
            return standings[place-1];
        });

        teamsList = _.filter(teamsList, function(team){
            return !_.contains(excluded, team.team_id._str);
        });

        var teams = api.bestFromTeamsList(numTeams, teamsList);

        return teams;
    }

    /**
     * Get the first numTeams from a list of teams based on normal ranking
     * @param  {number} numTeams  Number of teams to be returned
     * @param  {array} teamsList  List of team standings
     * @return {array}            List of first numTeams best teams
     */
    function bestFromTeamsList(numTeams, teamsList) {
        var teams = _.sortBy(_.sortBy(_.sortBy(teamsList, 'scored'), 'difference'), 'win').reverse();
        return teams.slice(0,numTeams);
    }

    /**
     * From a list of teams, get their _str ids
     * @param  {array} teamsList List of teams, in the leagues-teams format
     * @return {array}           List of team strings
     */
    function teamsToStrings(teamsList) {
        var ids = teamsList.map(function(team){
            if (typeof team === 'string') return team;
            if (typeof team.team_id === 'string') return team;
            return team.team_id._str;
        });

        return ids;
    }

    function createLeagueTeam(teamID, name, season) {
        if (typeof teamID === 'string') teamID = new Mongo.ObjectID(teamID);
        return {
          _id: teamID,
          team_id: teamID,
          name: name,
          season: season,
          position: 1,
          played: 0,
          win: 0,
          lose: 0,
          scored: 0,
          against: 0,
          difference: 0,
          lastpos: 0
        };
    }

    /**
     * Pass an array of leagues and the currentSeason. Returns all teams in the leagues, in different formats
     * @return {Object}               Contains teams, teamsID, teamIDStr
     */
    function teamsFromLeagues(leagues, currentSeason) {
        var res = {
            teams: [],
            teamsID: [],
            teamsIDStr: []
        };
        leagues.forEach(function (league) {
            league.seasons[currentSeason].teams.forEach(function (team) {
                res.teams.push(team);
                res.teamsID.push(team.team_id);
                res.teamsIDStr.push(team.team_id._str);
            });
        });

        return res;
    }

    function getSeasonsContainingTeams(teamIDs, seasonNum) {
        const seasons = Leagues.find({[`seasons.${seasonNum}.teams.team_id`] : {$in: teamIDs }}, {fields: { [`seasons.${seasonNum}.teams`]:1, name:1, country:1, level:1, series:1 }} ).fetch();

        return seasons;
    }

    function emptySeason() {
        return {
            teams: [],
            state: {
                round:1,
                matchesPlayed: 0,
                regularEnded: false,
                roundsd: false
            }
        }
    }

    return api;
}

export default model();