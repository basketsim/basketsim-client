import GameInfo from './../../../../../collections/GameInfo';
import Leagues from './../../../../../collections/Leagues.js';
import teamModel from './../../../../teams/server/models/team-datamodel';
import leagueModel from './../models/model.js';
import newleagueHelpers from './../helpers/newleagues-helpers';
import tools from './../../../../utils/common/api.js';
import teamduplicatesHelper from './../helpers/teamduplicates-helper';
import {Mongo} from 'meteor/mongo';

import _ from 'underscore';

function validateNewSeason() {
    console.log('Start: Validate new season');
    const seasonNum = GameInfo.findOne().season + 1;
    const allActiveTeamsIDs = teamModel.getActiveBy({}, {_id:1}).map((team) => {return team._id._str; });
    const leagues = Leagues.find({ [`seasons.${seasonNum}.teams`] : { $exists: true }}, {fields:{[`seasons.${seasonNum}.teams.team_id`]:1}}).fetch();
    const teamInLeaguesIDs = newleagueHelpers.teamIDStrFromLeagues(leagues, seasonNum);
    const duplicateTeams = tools.general.findDuplicates(teamInLeaguesIDs);
    const teamIDs = duplicateTeams.map((str) => {return new Mongo.ObjectID(str);});
    const leaguesWithTeams = leagueModel.getSeasonsContainingTeams(teamIDs, seasonNum);

    areAllActiveInLeagues(allActiveTeamsIDs, teamInLeaguesIDs);
    are14TeamsInAllLeagues(leagues, seasonNum);
    areTeamsInJustOneLeague(duplicateTeams);

    if (duplicateTeams.length > 0) teamduplicatesHelper.duplicatesDetails(duplicateTeams, leaguesWithTeams, seasonNum);
    console.log('End: Validate new season');
}

function areAllActiveInLeagues(allActiveTeamsIDs, teamInLeaguesIDs) {
    const diff = _.difference(allActiveTeamsIDs, teamInLeaguesIDs);

    if (diff.length > 0) {
        console.log(`There are ${diff.length} teams that are not in any leagues: ${diff}`);
    } else {
        console.log('All active teams are in leagues');
    }
}

function areTeamsInJustOneLeague(duplicateTeams) {
    if (duplicateTeams.length > 0) {
        console.log(`There are ${duplicateTeams.length} teams that are registered in multiple leagues: ${duplicateTeams}`);
    } else {
        console.log('All Teams are registered just once');
    }
}

function are14TeamsInAllLeagues(leagues, seasonNum) {
    const wrongLeagues = [];

    leagues.forEach((league) => {
       if (league.seasons[seasonNum].teams.length !== 14) wrongLeagues.push(league._id._str);
    });

    if (wrongLeagues.length > 0) {
        console.log(`There are leagues that have a wrong size: ${wrongLeagues}`);
    } else {
        console.log('All Leagues have the correct size');
    }
}

export default validateNewSeason;