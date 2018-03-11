import Teams from './../../../../../collections/Teams.js';
import Leagues from './../../../../../collections/Leagues.js';
import GameInfo from './../../../../../collections/GameInfo.js';

import _ from 'underscore';
import mongojs from 'mongojs';

function updateCompetitionReference() {
    console.log('STARTED: Update Competition Referece');
    const seasonNum = GameInfo.findOne().season;
    const nextSeasonNum = seasonNum + 1;

    const leagues = Leagues.find({}, {fields: {[`seasons.${nextSeasonNum}`] : 1, name:1, level:1, series:1 }});
    const teamsBulk = Teams.rawCollection().initializeUnorderedBulkOp();
    const length = leagues.count();

    leagues.forEach(function (league, i) {
        let season = league.seasons[nextSeasonNum];
        if (season && season.teams) {
            season.teams.forEach(function (team) {
                teamsBulk.find({_id: mongojs.ObjectId(team.team_id._str)}).updateOne({$set:{
                    ['competitions.natLeague.seasons.'+nextSeasonNum] : {
                        _id: league._id,
                        name: league.name,
                        level: league.level,
                        series: league.series
                    },
                    ['competitions.natLeague.currentSeason']: nextSeasonNum
                }});
            });
        }
        if (i % 1000 === 0) console.log(`PROGRESS: Update Competition Referece ${i}/${length}`);
    });

    console.log(`EXECUTE: ${length} leagues to Update Competition Referece`);
    teamsBulk.execute(function (err) {
        if (err) {
            conole.log('Update competition Reference Error', err);
        } else {
            console.log('ENDED: Update Competition Referece');
        }
    });
}

export default updateCompetitionReference;