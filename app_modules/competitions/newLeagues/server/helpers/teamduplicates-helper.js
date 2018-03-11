const teamDuplicatesHelper = {
    duplicatesDetails
};

/**
 *
 * @param duplicateTeams List of team id strings that are known to have duplicates in the season
 * @param leagues The leagues(season) where the duplication manifests
 * @param seasonNum The season number
 * @returns {Object} Object containing each string as a key. The value is an array of season-object teams that are duplicated
 */
function duplicatesDetails(duplicateTeams, leagues, seasonNum) {
    const groupedTeams = {};

    duplicateTeams.forEach((str) => {
        groupedTeams[str] = [];
    });

    leagues.forEach((league) => {
       let teams = league.seasons[seasonNum].teams;
       teams.forEach((team) => {
          if (_.contains(duplicateTeams, team.team_id._str)) {
              groupedTeams[team.team_id._str].push({
                  team: team,
                  country: league.country,
                  level: league.level,
                  name: league.name,
                  leagueID: league._id,
                  series: league.series
              });
          }
       });
    });

    return groupedTeams;
}

export default teamDuplicatesHelper;