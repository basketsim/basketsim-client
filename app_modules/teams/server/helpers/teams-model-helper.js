const teamsModelHelper = {
    createLeagueReferenceObject
};

function createLeagueReferenceObject(seasonNum, leagueID, name, level, series) {
    seasonNum = seasonNum.toString();
    level = parseInt(level, 10);
    series = parseInt(level, 10);

    return {
        seasons: {
            [seasonNum] : {
                _id: leagueID,
                name: name,
                level: level,
                series: series
            }
        }
    };
}

export default teamsModelHelper;