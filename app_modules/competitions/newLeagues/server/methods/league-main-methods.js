import leagueModel from './../models/model.js';
import validateNewSeason from './../actions/validate-new-season';
import fixDuplicates from './../actions/fix-duplicates';
import findPlayoffsDuplicates from './../actions/find-playoff-duplicates';
import fixLeaguesInvalidLength from './../actions/fix-leagues-invalidlength';

import Leagues from './../../../../../collections/Leagues';

import {Meteor} from 'meteor/meteor';

Meteor.methods({
    'competitions:newLeagues:getMinLevel': getMinLevel,
    'competitions:newLeagues:nameByCountryLevel': getNameByCountryLevel,
    'competitions:newLeagues:validate-new-season': validateNewSeason,
    'competitions:newLeagues:fix-duplicates': fixDuplicates,
    'competitions:playoffs:find-playoff-duplicates':findPlayoffsDuplicates,
    'competitions:newLeagues:fix-invalid-leagues': fixLeaguesInvalidLength
});

function getMinLevel(country, season) {
    var leagues = Leagues.find({country:country}, {fields: {level:1, ['seasons.'+season]:1}}).fetch();
    return leagueModel.getMinActiveLevel(leagues, season);
}

function getNameByCountryLevel(country, level) {
    var league = Leagues.findOne({country:country, level:level}, {fields: {name:1}});
    return league.name;
}