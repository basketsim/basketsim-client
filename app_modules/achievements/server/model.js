import leaguesModel from './../../competitions/newLeagues/server/models/model.js';

function model() {
    var api = {create, createNationalCup, insertNationalCup, createLeagueTrophy, insertLeagueTrophy};

    /**
     * Creates an achievement object.
     * Would normally need to do some data validation
     *  {
     *      category: trophy/achievement/player_medal
     *      team: personal/international
     *      team_id: team_id
     *      type: League/Cup/Fair Play Cup/Champions Series
     *      competition: {
     *        level: 1/2/3
     *        country: country/international
     *        h_season: seasonNumb,
     *        name: name
     *      }
     *  }
     */
    function create(category, teamType, achievementType, competitionInfo, teamID) {
        var a = {
            category: category,
            team: teamType,
            team_id: teamID,
            type: achievementType,
            competition: competitionInfo
        };
        return a;
    }

    function createNationalCup(country, seasonNumber, winnerID) {
        var competition = {
            level: 0,
            country: country,
            season: seasonNumber,
            name: ''
        }

        var award = api.create('trophy', 'personal', 'Cup', competition, winnerID);

        return award;
    }

    function createLeagueTrophy(league, seasonNum) {
        var season = league.seasons[seasonNum];
        var winner = leaguesModel.teamOnPlace(1, season);

        if (!winner) return;
        var award = {
            category: 'trophy',
            team: 'personal',
            team_id: winner.team_id,
            type: 'League',
            competition: {
                level: league.level,
                country: league.country,
                season: seasonNum,
                name: league.name
            }
        };

        return award;
    }

    function insertLeagueTrophy(league, seasonNum) {
        var award = api.createLeagueTrophy(league, seasonNum);
        UserInfo.update({team_id:award.team_id}, {$push: {achievements: award}}, function(){});
    }

    function insertNationalCup(country, seasonNumber, winnerID) {
        var award = api.createNationalCup(country, seasonNumber, winnerID);
        UserInfo.update({team_id: winnerID}, {$push: {achievements: award}}, function(){});
    }

    return api;
}

export default model();