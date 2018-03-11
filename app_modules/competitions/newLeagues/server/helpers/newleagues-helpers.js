const newleaguesHelpers = {
    teamIDStrFromLeagues
};

function teamIDStrFromLeagues(leagues, seasonNum) {
    const teamIDStrs = [];

    leagues.forEach((league) => {
        let teams = league.seasons[seasonNum].teams;
        teams.forEach((team) => {
            teamIDStrs.push(team.team_id._str);
        });
    });

    return teamIDStrs;
}

export default newleaguesHelpers;