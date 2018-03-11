import matchesCreation from './../creation.js';
import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import Teams from './../../../../collections/Teams.js';
import Matches from './../../../../collections/Matches.js';
import updates from './../updates.js';
import Chance from 'chance';
import moment from 'moment';
import _ from 'underscore';
import matches from "../api";


function matchesTestActions() {
    var api = { createASPTestMatch, playTestMatches, deleteTestMatches };

    var chance = new Chance();

    function createASPTestMatch(matchType) {
        var homeId = new Mongo.ObjectID('55cf113f1cc5f84ae63e4b00');
        var roTeams = Teams.find({country: 'Romania'}, {fields: {_id: 1}}).fetch();
        var awayId = chance.pick(roTeams)._id;
        var timestamp = moment().add(1, 'days').valueOf();

        var competition = dummyCompetition(matchType);
        var match = null;
        match = matchesCreation.setMatch(homeId, awayId, 'home', null, timestamp, competition, {test:true});

        console.log('created test match', match);
    }

    function playTestMatches() {
      matches.updates.simExternal();
    }

    function deleteTestMatches() {
        Matches.remove({ 'optional.test':true });
    }

    function dummyCompetition(matchType) {
        var competition = {};
        switch (matchType) {
        case 'cup':
            competition = {
                'collection': 'NationalCups',
                '_id': new Mongo.ObjectID('80dff62ae9525ffd5b788f25'),
                'season': 24,
                'round': 1,
                'type': 'Cup',
                'stage': 'Cup'
            };
            break;

        case 'league':
            competition = {

            };
            break;

        case 'friendly':
            competition = {

            };
            break;
        }

        return competition;
    }

    return api;
}

export default matchesTestActions();