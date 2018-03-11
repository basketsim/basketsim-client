import teamModelHelper from './../../../../teams/server/helpers/teams-model-helper';
import createBotTeam from './../../../../teams/server/actions/create-bot-team';
import GameInfo from './../../../../../collections/GameInfo';
import Leagues from './../../../../../collections/Leagues.js';
import leagueModel from './../models/model';
import moment from 'moment';

function fixLeaguesInvalidLength(seasonTeam) {
    console.log('STARTED: Fix Invalid Leagues');
    var botCount = 0;
    const seasonNum = GameInfo.findOne().season + 1;
    const leagues = Leagues.find({ [`seasons.${seasonNum}.teams`] : { $exists: true }}, {fields:{country:1, level:1, series:1, [`seasons.${seasonNum}.teams.team_id`]:1}}).fetch();
    const wrongLeagues = [];

    leagues.forEach((league) => {
       if (league.seasons[seasonNum].teams.length !== 14) wrongLeagues.push(league);
    });

    wrongLeagues.forEach((wl) => {
        botCount ++;
        let teamName = 'Bot ' + seasonNum + moment().format('MM') + botCount;
        let competitions = {
            natLeague: teamModelHelper.createLeagueReferenceObject(seasonNum, wl._id, teamName, wl.level, wl.series)
        };
        createBotTeam.insert(teamName, competitions, wl.country, (team) => {
            let leagueTeam = leagueModel.createLeagueTeam(team._id, teamName, seasonNum);
            Leagues.update({_id: wl._id}, {$push: {
                //need the full league object here
                [`seasons.${seasonNum}.teams`] : leagueTeam }
            });
        });
    });
    console.log('ENDED: Fix Invalid Leagues');
}

export default fixLeaguesInvalidLength;