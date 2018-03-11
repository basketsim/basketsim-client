import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

Template.AdminTools.events({
    'click .gen-league-matches': function () {
        Meteor.call('createLeagueMatches', 'NAT_LEAGUE', '');
    },
    'click .update-players': function() {
        Meteor.call('updatePlayerSkills');
    },
    'click .migration-update': function() {
        Meteor.call('migrationUpdate');
    },
    'click .migrate-training': function() {
        Meteor.call('migrateTraining');
    },
    'click .decode-characters': function(){
        Meteor.call('decodeUtf');
    },
    'click .play-match': function(){
        Meteor.call('admin:test:match', 'Py4aeH8oqNLCoyNGh');
    },
    'click .restructure-dates': function() {
        Meteor.call('restructureDates');
    },
    'click .generate-summer-trophy': function() {
        Meteor.call('newStSeason');
    },
    'click .character-format': function() {
        Meteor.call('formatCharacter');
    },
    'click .migrate-trainers': function() {
        Meteor.call('migrateTrainers');
    },
    'click .fifty-matches': function() {
        Meteor.call('genTestMatches', 50);
    },
    'click .twohundred-matches': function() {
        Meteor.call('genTestMatches', 200);
    },
    'click .max-matches': function() {
        Meteor.call('genTestMatches', 0);
    },
    'click .insta-match': function() {
        Meteor.call('aspTestMatch');
    },
    'click .get-preferences': function () {
        Meteor.call('userForumPreferences');
    },
    'click .average-fouls': function() {
        Meteor.call('foulsAverage', 1000);
    },
    'click .mock-senior-training': function(){
        Meteor.call('mockProgress', 17, 80, 10);
    },
    'click .coach-ability': function() {
        Meteor.call('migrateCoachMarket');
    },
    'click .coach-average': function() {
        Meteor.call('coachAverage', function(err, data){
        });
    },
    'click .create-coaches': function() {
        Meteor.call('createCoaches');
    },
    'click .maintain-market': function() {
        Meteor.call('maintainCoachMarket');
    },
    'click .train-youth': function() {
        Meteor.call('trainAllYouth');
    },
    'click .discourse-get': function() {
        Meteor.call('discourseSSO');
    },
    'click .train-senior': function() {
        Meteor.call('trainSeniorCron');
    },
    'click .rerun-train-senior': function () {
        Meteor.call('rerunTrainSeniorCron');
    },
    'click .market-activity': function() {
        Meteor.call('insertAllMarketActivity');
    },
    'click .temp-money': function() {
        Meteor.call('calculateTempMoney');
    },
    'click .float-weight': function() {
        Meteor.call('floatWeight');
    },
    'click .check-nan': function() {
        Meteor.call('checkNan');
    },
    'click .insert-game-text': function(){
        Meteor.call('admin:insert-game-text');
    },
    'click .users-mark-removal': function(){
        Meteor.call('user_management:inactive_cleaner:mark');
    },
    'click .users-inspect-removal': function() {
        Meteor.call('user_management:inactive_cleaner:inspectRemoval');
    },
    'click .users-remove': function(){
        Meteor.call('user_management:inactive_cleaner:remove');
    },
    'click .testmatch-asp-cup': function(){
        Meteor.call('matches:t:createASPMatch', 'cup');
    },
    'click .play-testmatches': function(){
        Meteor.call('matches:t:playMatches');
    },
    'click .delete-testmatches': function(){
        Meteor.call('matches:t:deleteMatches');
    },
    'click .add-experience': function() {
        Meteor.call('addExperience');
    },
    'click .recalculate-youth-wr': function() {
        Meteor.call('recalculateYouthWr');
    },
    'click .teams-per-country': function() {
        Meteor.call('activeTeamsPerCountry');
    },
    'click .insert-cups': function(){
        Meteor.call('competitions:national-cup:create');
    },
    'click .insert-cup-season': function(){
        Meteor.call('competitions:national-cup:insert-season');
    },
    'click .cup-first-round': function(){
        Meteor.call('competitions:national-cup:insert-first-round');
    },
    'click .reset-cup-ro': function() {
        Meteor.call('admin:test:cup:resetCupRo', 1, function (error, result) {});
    },
    'click .play-cup-round-ro': function() {
        Meteor.call('admin:test:cup:runRoundRo', 1, function (error, result) {});
    },
    'click .play-cup-round-all': function() {
        Meteor.call('admin:test:cup:runRoundAll', 1, function (error, result) {});
    },
    'click .test-end-cup': function() {
        Meteor.call('competitions:national-cup:testEndSeason');
    },
    'click .end-cup': function() {
        Meteor.call('competitions:national-cup:endSeason');
    },
    'click .update-matches': function() {
        Meteor.call('admin:test:updateMatches');
    },
    'click .add-game-info': function() {
        Meteor.call('admin:game-info:addGameInfo');
    },
    'click .floatify-skills': function() {
        Meteor.call('admin:one-time-migration:players:skills:convert');
    },
    'click .schedule-playoff': function() {
        Meteor.call('competitions:leagues:playoff:schedule');
    },
    'click .reset-playoff': function() {
        Meteor.call('competitions:leagues:playoff:reset');
    },
    'click .play-playoff': function() {
        Meteor.call('competitions:leagues:playoff:play');
    },
    'click .reschedule-playoff': function () {
        Meteor.call('competitions:newLeagues:playoff:rescheduleMatches');
    },
    'click .end-playoff': function() {
        Meteor.call('competitions:leagues:playoff:update');
    },
    'click .find-playoff-duplicates': function () {
        Meteor.call('competitions:playoffs:find-playoff-duplicates');
    },
    'click .count-bots': function() {
        Meteor.call('competitions:newLeagues:tools:botsPercentageCountry');
    },
    'click .new-series-usa': function() {
        Meteor.call('competitions:newLeagues:tools:newSeries', 'USA');
    },
    'click .new-series-serbia': function() {
        Meteor.call('competitions:newLeagues:tools:newSeries', 'Serbia');
    },
    'click .fix-duplicates': function () {
        Meteor.call('competitions:newLeagues:fix-duplicates');
    },
    'click .fix-invalid-leagues': function () {
        Meteor.call('competitions:newLeagues:fix-invalid-leagues');
    },
    'click .udpate-score-difference': function() {
        Meteor.call('competitions:leagues:updates:scoreDifference');
    },
    'click .stats-empty': function() {
        Meteor.call('stats:setEmptyStats');
    },
    'click .stats-players': function() {
        Meteor.call('stats:updatePlayers');
    },
    'click .stats-players-to-comp': function() {
        Meteor.call('stats:addPlayersToCompetition');
    },
    'click .stats-teams': function() {
        Meteor.call('stats:updateTeam');
    },
    'click .create-stats': function() {
        Meteor.call('stats:setAll');
    },
    'click .reset-stats': function() {
        Meteor.call('stats:reset');
    },
    'click .migrate-achievements': function() {
        Meteor.call('achievements:migrate');
    },
    'click .add-fitness': function() {
        Meteor.call('PUT:admin/players/fitness');
    },
    'click .add-test-matches': function () {
        Meteor.call('POST:admin/matches/test-matches');
    },
    'click .change-dates': function () {
        Meteor.call('PUT:admin/matches/date');
    },
    'click .decode-names': function () {
      Meteor.call('PUT:admin/players/names');
    },
    'click .full-names': function () {
      Meteor.call('PUT:admin/players/fullNames');
    },
    'click .run-test': function () {
      Meteor.call('POST:admin/sim-competition/TestGE', (err) => {if (err) sAlert.error(err);});
    },
    'click .return-fans': function () {
      Meteor.call('POST:matches/fans/return');
    },
    'click .finish-previous-matches': function () {
      Meteor.call('POST:matches/state/finished');
    },
      'click .finish-previous-matches2': function () {
        Meteor.call('POST:matches/state/finished2');
      },
    'click .setfpc-achievements': function() {
        Meteor.call('achievements:setfpc');
    },
    'click .decode-achievements': function() {
        Meteor.call('achievements:decode');
    },
    'click .reset-achievements': function() {
        Meteor.call('achievements:reset');
    },

    /**
     * LEAGUE - END SEASON
     * ALL
     */
    'click .newlegue-set-score-difference': function() {
        Meteor.call('competitions:newLeagues:setScoreDifference');
    },
    'click .newlegue-wildcards': function() {
        Meteor.call('competitions:newLeagues:wildcards');
    },
    'click .newlegue-reshuffle': function() {
        Meteor.call('competitions:newLeagues:reshuffle');
    },
    'click .newlegue-update-competition-reference': function () {
        Meteor.call('competitions:newLeagues:updateCompReference');
    },
    'click .newlegue-validate': function() {
        Meteor.call('competitions:newLeagues:validate-new-season');
    },
    'click .newlegue-insert-playoff': function() {
        Meteor.call('competitions:newLeagues:insertPlayoff');
    },
    'click .newlegue-send-rewards': function() {
        Meteor.call('competitions:newLeagues:sendRewards');
    },
    'click .newlegue-end-season': function() {
        Meteor.call('competitions:newLeagues:endRegularSeason');
    },
    /**
     * LEAGUE - END SEASON
     * TEST
     */
    'click .newlegue-test-set-score-difference': function() {
        Meteor.call('test:competitions:newLeagues:setScoreDifference');
    },
    'click .newlegue-test-insert-playoff': function() {
        Meteor.call('test:competitions:newLeagues:insertPlayoff');
    },
    'click .newlegue-test-send-rewards': function() {
        Meteor.call('test:competitions:newLeagues:sendRewards');
    },
    'click .newlegue-test-end-season': function() {
        Meteor.call('test:competitions:newLeagues:endRegularSeason');
    },
    /**
     * LEAGUE - START NEW SEASON
     * ALL
     */
    'click .newlegue-set-leagues': function() {
        Meteor.call('competitions:newLeagues:insertLeagues');
    },
    'click .newlegue-schedule-matches': function() {
        Meteor.call('competitions:newLeagues:schedule-matches:schedule');
    },
    'click .newlegue-check-scheduled-matches': function() {
        Meteor.call('competitions:newLeagues:schedule-matches:check');
    },
    /**
     * LEAGUE - START NEW SEASON
     * TEST
     */
    'click .newlegue-test-wildcards': function(){
        Meteor.call('test:competitions:newLeagues:wildcards');
    },
    'click .newlegue-test-reshuffle': function() {
        Meteor.call('test:competitions:newLeagues:reshuffle');
    },
    'click .newlegue-test-set-leagues': function() {
        Meteor.call('test:competitions:newLeagues:insertLeagues');
    },
    'click .newlegue-test-schedule-matches': function() {
        Meteor.call('test:competitions:newLeagues:schedule-matches:schedule');
    },
    'click .newlegue-test-check-scheduled-matches': function() {
        Meteor.call('test:competitions:newLeagues:schedule-matches:check');
    },

    /**
     * OLD LEAGUE UPDATES- [DEPRECATED]
     * ALL
     */
    'click .set-league-state': function() {
        Meteor.call('competitions:leagues:updates:setState');
    },
    'click .start-new-season': function() {
        Meteor.call('competitions:leagues:season-updates-methods:seasonUpdate');
    },
    'click .schedule-league-matches': function() {
        Meteor.call('competitions:leagues:league-matches-method:scheduleLeagueMatches', '10-04-2016');
    },
    'click .season-unset': function() {
        Meteor.call('competitions:leagues:season-updates-methods:unsetLatestSeason');
    },
    'click .check-league-matches': function() {
        Meteor.call('competitions:leagues:league-matches-method:checkMatches');
    },
    'click .play-test-season': function() {
        Meteor.call('competitions:leagues:test:play-season');
    },
    'click .season-age-players': function() {
        Meteor.call('players:season-updates:increaseAge');
    },
    'click .remove-ageupdated-flag': function() {
        Meteor.call('players:season-updates:removeAgeUpdatedFlag');
    },
    'click .autopromote-youth': function () {
        Meteor.call('players:season-updates:autopromoteYouth');
    },
    'click .youth-wage-update': function () {
        Meteor.call('players:season-updates:youthWageUpdate');
    },
    'click .senior-wage-update': function () {
        Meteor.call('players:season-updates:seniorWageUpdate');
    },
    'click .remove-wageupdate-flag': function () {
        Meteor.call('players:season-updates:removeWageUpdatedFlag');
    },

    /**
     * CRONS
     */
    'click .run-update-bans': () => {
        Meteor.call('teams:actions:updateBans');
    },
    'click .run-finish-transfers': function() {
        Meteor.call('runEndTransfers');
    },
    'click .multiple-growth': function() {
        Meteor.call('multiple-growth');
    },
    'click .growth': function() {
        Meteor.call('growth');
    },
    'click .advance-calendar-week': function() {
        Meteor.call('admin:game-info:advanceCalendarWeek');
    },
    'click .clean-senior-training': function() {
        Meteor.call('training:senior:clean', function () {});
    },
    'click .run-senior-training': function() {
        Meteor.call('training:senior:run', function () {});
    },
    'click .update-ev': function() {
        Meteor.call('crons:methods:updateEV');
    },
    'click .remove-old-news': function() {
        Meteor.call('news:admin:removeOldNews');
    },
    'click .finance-weekly-updates': function() {
        Meteor.call('finances:actions:weeklyUpdate');
    },
    'click .facilities-arena-complete': function() {
        Meteor.call('facilities:arena:completeConstruction');
    },

    /*One Time Tools*/
    'click .insert-missing-market-activity': function () {
        Meteor.call('market-activity:insertMissingEntries');
    },

    /*Other Tools*/
    'submit #validate-email-form': function (e) {
        var input = $('#validate-email-form').serializeArray();
        e.preventDefault();
        Meteor.call('user_management:emailValidation', input[0].value, (err, succ) => {
            if (err) {
                sAlert.error(err.reason);
            } else {
                sAlert.success(`${input[0].value} has been validated successfuly`);
            }
        });
    }

    /**
     * SENDING MAILS
     */
    // 'click .send-test-email': function() {
    //     Meteor.call('sendEmail', 'pixelsoffreedom@gmail.com');
    // },
    // 'click .send-email-all': function() {
    //     Meteor.call('sendEmail', 'allUsers');
    // },

});