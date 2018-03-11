import Teams from './../../../../collections/Teams';
/**
 * This is the true team model, as a model is defined in the patterns document.
 * Models should have only impure functions that either get, set, update or delete data on their collection.
 * @type {{updateLeagueInfo: updateLeagueInfo}}
 */
const teamModel = {
    updateLeagueInfo
};
/**
 * Updating league info of team
 * @param {object} teamID
 * @param {int} seasonNum
 * @param {object} leagueID
 * @param {string} leagueName
 * @param {int} leagueLevel
 * @param {int} leagueSeries
 */
function updateLeagueInfo(teamID, seasonNum, leagueID, leagueName, leagueLevel, leagueSeries) {
    Teams.update({_id: teamID}, {$set: {
        [`competitions.natLeague.seasons.${seasonNum}`] : {
            _id: leagueID,
            name: leagueName,
            level: leagueLevel,
            series: leagueSeries
        }
    }});
}

export default teamModel;