import butils from './../../../../utils/common/api';
import GameInfo from './../../../../../collections/GameInfo';
import {Playoffs} from './../../../../../collections/collections';

function findPlayoffDuplicates() {
    const seasonNum = GameInfo.findOne().season;
    const playoffs = Playoffs.find({season:seasonNum}, {fields: {team1_id:1, team2_id:1}}).fetch();
    const teamIDs = [];

    playoffs.forEach((playoff) => {
       teamIDs.push(playoff.team1_id._str);
       teamIDs.push(playoff.team2_id._str);
    });

    const duplicates = butils.general.findDuplicates(teamIDs);

    console.log('groupedTeams', duplicates);
}

export default findPlayoffDuplicates;