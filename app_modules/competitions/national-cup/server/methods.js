import api from './api.js'
import { updateAllCupsOnEnd } from './endSeason.js';
Meteor.methods({
    'competitions:national-cup:create': function(){
        if (!sbutils.validations.isAdmin(this.userId)) return;
        console.log('competitions:national-cup:create was called');
        api.create.collections();
    },
    'competitions:national-cup:insert-season': function(){
        if (!sbutils.validations.isAdmin(this.userId)) return;
        console.log('competitions:national-cup:insert-season was called');
        api.create.seasons();
    },
    'competitions:national-cup:insert-first-round': function() {
        if (!sbutils.validations.isAdmin(this.userId)) return;
        console.log('competitions:national-cup:insert-season was called');
        api.create.scheduleRounds();
    },
    'competitions:national-cup:get-matches': function(ids) {
        var matches = Matches.find({_id: {$in: ids}}, {fields: {
            'awayTeam.defensive': false,
            'awayTeam.offensive': false,
            'awayTeam.startingFive': false,
            'awayTeam.subs': false,
            'homeTeam.defensive': false,
            'homeTeam.offensive': false,
            'homeTeam.startingFive': false,
            'homeTeam.subs': false,
            'matchHistory': false
        }}).fetch();

        var teamIDs = [];
        _.each(matches, function(m){
            if (m.state.finished!== true) {
                delete m.awayTeam.matchRatings;
                delete m.homeTeam.matchRatings;
            }

            teamIDs.push(m.awayTeam.id);
            teamIDs.push(m.homeTeam.id);
        });

        var teams = Teams.find({_id: {$in: teamIDs}}, {field: {name:1}}).fetch();

        return {
            matches: matches,
            teams: teams
        }
    },
    'competitions:national-cup:get-cup': function(country) {
        return NationalCups.findOne({country: country});
    },
    'competitions:national-cup:testEndSeason': function() {
        if (!sbutils.validations.isAdmin(this.userId)) return;
        updateAllCupsOnEnd(false);
    },
    'competitions:national-cup:endSeason': function() {
        if (!sbutils.validations.isAdmin(this.userId)) return;
        updateAllCupsOnEnd(true);
    }
})