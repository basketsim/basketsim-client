import GameInfo from './../../../../../collections/GameInfo';
import Leagues from './../../../../../collections/Leagues.js';
import leagueModel from './../models/model.js';
import teamModel from './../../../../teams/server/models/team-model';
import teamModelHelper from './../../../../teams/server/helpers/teams-model-helper';
import newleagueHelpers from './../helpers/newleagues-helpers';
import tools from './../../../../utils/common/api.js';
import teamduplicatesHelper from './../helpers/teamduplicates-helper';
import createBotTeam from './../../../../teams/server/actions/create-bot-team';
import {Mongo} from 'meteor/mongo';
import _ from 'underscore';
import moment from 'moment';

function fixDuplicates() {
    console.log('Started: Fix Duplicates');
    const seasonNum = GameInfo.findOne().season + 1;
    const leagues = Leagues.find({ [`seasons.${seasonNum}.teams`] : { $exists: true }}, {fields:{[`seasons.${seasonNum}.teams.team_id`]:1}}).fetch();
    const teamInLeaguesIDs = newleagueHelpers.teamIDStrFromLeagues(leagues, seasonNum);
    const duplicateTeams = tools.general.findDuplicates(teamInLeaguesIDs);
    const teamIDs = duplicateTeams.map((str) => {return new Mongo.ObjectID(str);});
    const leaguesWithTeams = leagueModel.getSeasonsContainingTeams(teamIDs, seasonNum);

    const duplicatesDetails = teamduplicatesHelper.duplicatesDetails(duplicateTeams, leaguesWithTeams, seasonNum);
    var botCount = 0;
    for (let duplicatedTeamIDStr in duplicatesDetails) {
        let levelSortedSeasonTeams = _.sortBy(duplicatesDetails[duplicatedTeamIDStr], 'level');
        excludeAndUpdateHighestLevel(levelSortedSeasonTeams, seasonNum);
        levelSortedSeasonTeams.forEach((seasonTeam) => {
            botCount ++;
            replaceWithBot(seasonTeam, seasonNum, botCount);
        });
    }
    console.log('Ended: Fix Duplicates');
}

function excludeAndUpdateHighestLevel(levelSortedSeasonTeams, seasonNum) {
    const teamInfo = levelSortedSeasonTeams.shift();
    teamModel.updateLeagueInfo(teamInfo.team.team_id, seasonNum, teamInfo.leagueID, teamInfo.name, teamInfo.level, teamInfo.series);
}
/**
 * Replace a team object from a season with a new team object of a newly created bot.
 * According to some, this function should not have comments as it is a private function.
 * @param    {object}  seasonTeam           - Contains info on the league and the team that has to be replaced
 * @property {object}  seasonTeam.leagueID  - League Mongo ID
 * @property {string}  seasonTeam.country   - League country
 * @property {level}   seasonTeam.level     - League level
 * @property {int}     seasonTeam.series    - League series
 * @property {object}  seasonTeam.name      - League name
 * @property {object}  seasonTeam.team      - Season team object
 */
function replaceWithBot(seasonTeam, seasonNum, botCount) {
    const teamName = 'Bot ' + seasonNum + moment().format('MM') + botCount;
    const competitions = {
        natLeague: teamModelHelper.createLeagueReferenceObject(seasonNum, seasonTeam.leagueID, seasonTeam.name, seasonTeam.level, seasonTeam.series)
    };

    createBotTeam.insert(teamName, competitions, seasonTeam.country, (team) => {
        Leagues.update({_id: seasonTeam.leagueID, [`seasons.${seasonNum}.teams.team_id`]: seasonTeam.team.team_id}, {$set: {
            [`seasons.${seasonNum}.teams.$._id`]: team._id,
            [`seasons.${seasonNum}.teams.$.team_id`]: team._id,
            [`seasons.${seasonNum}.teams.$.name`]: teamName
        }});
    });
}

export default fixDuplicates;