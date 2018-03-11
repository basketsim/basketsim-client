/* global SyncedCron */
import matches from './../../matches/server/api.js';
import training from './../../training/server/api.js';
import players from './../../players/server/api.js';
import config from './conf.js';
import news from './../../news/server/api.js';
import markets from './../../markets/server/api.js';
import gameInfo from './../../admin/server/game-info/update.js';
import financeWeeklyUpdate from './../../finances/server/actions/weekly_update.js';
import arenaActions from './../../facilities/server/actions/arena-actions';

if (config.shouldRunCrons()) {
    SyncedCron.start();

    SyncedCron.add({
        name: 'Friday updates',
        schedule: function(parser) {
            return parser.text('at 14:00 on Friday');
        },
        /**
         * Allow new pulls
         * Grow Players
         */
        job: function(){
            players.youth.allowNewPulls();
            players.grow.allTeams();
        }
    });

    SyncedCron.add({
        name: 'Finance updates',
        schedule: function(parser) {
            return parser.text('at 13:30 on Friday');
        },
        job: financeWeeklyUpdate.run
    });

    SyncedCron.add({
        name: 'Simulate Matches',
        schedule: function(parser) {
            // parser is a later.parse object
            // return parser.text('every Friday');
            return parser.text('every 5 minutes');
            // return parser.text('every 20 seconds');
        },
        job: function () {
          // matches.updates.simulate();
          matches.updates.simExternal();
        }
    });

    SyncedCron.add({
        name: 'Update finished matches',
        schedule: function(parser) {
            // parser is a later.parse object
            // return parser.text('every Friday');
            return parser.text('every 6 minutes');
            // return parser.text('every 10 seconds');
        },
        job: function () {
          matches.updates.finish();
        }
    });

    // SyncedCron.add({
    //     name: 'Archive old matches',
    //     schedule: function(parser) {
    //         // parser is a later.parse object
    //         // return parser.text('every 17 minutes');
    //         return parser.text('every 12 hours');
    //     },
    //     job: matches.updates.archive
    // });

    SyncedCron.add({
        name: 'Clean Training',
        schedule: function(parser) {
            return parser.text('at 12:30 on Thursday');
        },
        job: function() {
            training.seniorCron.clean();
        }
    });

    SyncedCron.add({
        name: 'Training',
        schedule: function(parser) {
            /*The time displayed is New York Time. Convert manually to Stockholm*/
            /*Stockholm: 2PM, NY: 8AM*/
            return parser.text('at 14:00 on Thursday');
            // return parser.text('at 16:00 on Friday');
            // return parser.text('at 13:15');
        },
        job: function() {
            news.admin.trainingStarted();
            training.youth.trainAll();
            training.seniorCron.run();
            players.ev.update();
            news.admin.trainingEnded();
        }
    });

    SyncedCron.add({
        name: 'DailyUpdates',
        schedule: function(parser) {
            return parser.text('every 24 hours');
        },
        job: function() {
            markets.coach.maintain();
            arenaActions.finishConstruction();
        }
    });

    SyncedCron.add({
        name: 'TransferDeadline',
        schedule: function(parser) {
            return parser.text('every 35 seconds');
        },
        job: markets.transfer.finish
    });

    SyncedCron.add({
        name: 'Week Progress',
        schedule: function(parser) {
            return parser.text('at 00:01 on Sunday');
        },
        job: gameInfo.weekProgress
    });
    SyncedCron.add({
        name: 'Clear News',
        schedule: function(parser) {
            return parser.text('every 24 hours');
        },
        job: news.model.deleteTwoWeeksOld
    });
}
