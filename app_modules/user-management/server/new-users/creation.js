import playersMod from './../../../players/server/api';
import markets from './../../../markets/server/api.js';
import teamModel from './../../../teams/server/model.js';
import leaguesModel from './../../../competitions/newLeagues/server/models/model.js';
import { Accounts } from 'meteor/accounts-base';

function userCreation() {
    var api = {insert, createUserInfo, selectTeam, insertUserInfo, getEmail,
                _availablePlaces, _minLevelLeaguesForNewTeam, _createNewPlayers};

    /**
     * Main exported function. Inserts user info team and players based on the sent parameters.
     * @return {[type]} [description]
     */
    function insert(user, username, teamname, country) {
        var teamID = api.selectTeam(country); //if no team selected, create team and league
        if (teamID) {
            api.insertUserInfo(user, username, country, teamID);
            teamModel.resetTeamAndDependecies(teamID, teamname, country);
        } else {
            throw new Meteor.Error('country-no-places', `There are no free places available in ${country}. Please select another country or contact basketsim@basketsim.com`);
        }
    }

    function insertUserInfo(user, username, country, teamID) {
        var userinfo = createUserInfo(user, username, country, teamID);

        UserInfo.insert(userinfo, function (err, userinfoID) {
            if (err) throw new Meteor.Error(err);
            Meteor.users.update({_id: user._id}, {$set:{
                userInfo_id: userinfoID
            }});
            api._createNewPlayers(country, teamID);
            try {
                Accounts.sendVerificationEmail(user._id);
            } catch (e) {
                console.log('Email verification failed');
            }

        });
    }

    function createUserInfo(user, username, country, teamID) {
        var userinfo = {
            username: username,
            email: api.getEmail(user),
            team_id: teamID,
            signed: new Date(), //this has been modified from timestamp to full date object
            lastlog: new Date(), //this has been modified from timestamp to full date object
            lang: 'en',
            originCountry: country,
            supporter_days: 15,
            national_team: null,
        };

        return userinfo;
    }

    /**
     * Check if a team exists, reset it and assign it to a new user. If the team does not exist (no teams left in the game) a new league needs to be created
     * The team and league creation are handled in their respective models
     * @return {ObjectID}          Id of selected team. If no team is selected, return null
     */
    function selectTeam(country) {
        var teamID = {},
            teams = [],
            selectedLeagues = [],
            selectedSeason = {},
            leagues = [],
            currSeason = 0,
            botTeams = [],
            teamIDs = [],
            availablePlaces = [];

        selectedLeagues = [];
        leagues = Leagues.find({country:country}).fetch();

        if (!leagues[0]) {
            //send notification to admin and then throw the error
            throw new Meteor.Error('country-no-leagues', `There are no league available in ${country}. Please select another league or contact basketsim@basketsim.com about future availability of ${country}`);
        }

        currSeason = GameInfo.findOne().season;

        leagues = api._minLevelLeaguesForNewTeam(leagues, currSeason);
        if (!leagues) return null;

        teamIDs = leaguesModel.teamsFromLeagues(leagues, currSeason).teamsIDStr;
        botTeams = teamModel.botsInList(teamIDs);
        availablePlaces = api._availablePlaces(leagues, botTeams, currSeason);

        if (!availablePlaces[0]) throw new Meteor.Error('country-no-leagues-!availablePlaces[0]', `There are no league available in ${country}. Please select another league or contact basketsim@basketsim.com about future availability of ${country}`);

        availablePlaces = _.sortBy(_.sortBy(availablePlaces, 'series'), 'places'); //add the user in the league with most teams (least available places)

        selectedSeason = availablePlaces[0].league.seasons[currSeason];
        teams = leaguesModel.sortTeamsByStanding(selectedSeason);
        teams = teams.map(function(team){
            return team.team_id._str;
        });
        teams = _.intersection(teams, botTeams);
        teamID = teams[0];
        teamID = butils.general.objectID(teamID);
        if (!teamID) throw new Meteor.Error('country-no-leagues', `There are no league available in ${country}. Please select another league or contact basketsim@basketsim.com about future availability of ${country}`);
        return teamID;
    }

    /**
     * Rules for min level for new team:
     * * Level should be defined and there should be teams in it
     * * Should have some available places (bot teams)
     * * Should be the lowest possible level, unless the lowest is full of bots
     * @return {[type]} [description]
     */
    function _minLevelLeaguesForNewTeam(leagues, currSeason) {
        var minActiveLevel = 1,
            minAbsoluteLevel = 1,
            teamIDs = [],
            botTeams = [],
            levelLeagues = [];

        minActiveLevel = leaguesModel.getMinActiveLevel(leagues, currSeason);
        levelLeagues = _.where(leagues, {level: minActiveLevel});

        teamIDs = leaguesModel.teamsFromLeagues(levelLeagues, currSeason).teamsIDStr;
        botTeams = teamModel.botsInList(teamIDs);

        if (_.intersection(botTeams, teamIDs).length === 0) {
            minAbsoluteLevel = leaguesModel.getMinLeagueLevel(leagues, currSeason);
            if (minActiveLevel === minAbsoluteLevel) return null;

            levelLeagues = _.where(leagues, {level: minAbsoluteLevel});
        }

        return levelLeagues;
    }

    /**
     * Pair each league with the number of available places (bot teams) that it contains
     * @return {Array}            List of leagues/places object pairs
     */
    function _availablePlaces(leagues, botTeams, currSeason) {
        var availablePlaces = [];

        leagues.forEach(function (league) {
            let teamIDs = leaguesModel.teamsFromLeagues([league], currSeason).teamsIDStr;
            let botsLength = 14 - _.difference(teamIDs, botTeams).length;
            let places = 0;

            places = botsLength;
            if (places !== 0) availablePlaces.push({league: league, places: places, series:league.series});
        });

        return availablePlaces;
    }

    // function _arePlacesAvailable(availablePlaces) {
    //     var available = false;
    //     availablePlaces.forEach(function (place) {
    //         if (place.places !== 0) available = true;
    //     });

    //     return available;
    // }

    function _createNewPlayers(country, team_id) {
        var positions = ['PG','PG','SG','SG','SF','SF','PF','PF','C','C'];
        var players = [];
        positions.push(positions[Math.round(Math.random()*10)]);
        positions.push(positions[Math.round(Math.random()*10)]);
        _.each(positions, function(pos){
            Players.insert(playersMod.senior.createSenior(country, team_id, pos), function() {});
        });
    }

    /**
     * Extracting email from google, facebook, or email login
     * @param  {object} user user object
     */
    function getEmail(user) {
        var email = '';

        if (user.emails && user.emails[0]) {
            email = user.emails[0].address;
        } else if (user.services && user.services.google) {
            email = user.services.google.email;
        } else if (user.services && user.services.facebook) {
            email = user.services.facebook.email;
        }

        return email;
    }

    return api;
}

export default userCreation();