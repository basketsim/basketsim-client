import Teams from './../../../../collections/Teams.js';
import GameInfo from './../../../../collections/GameInfo.js';
import finaceModel from './../models/finance-model.js';
import teamsModel from './../../../teams/server/models/team-datamodel.js';
import leaguesModel from './../../../competitions/newLeagues/server/models/model.js';
import Monitor from './../../../monitoring/server/models/monitor.js';
import gameTextModel from './../../../admin/server/game-text/gametext-model.js';
import butils from './../../../utils/common/api.js';
import { Mongo } from 'meteor/mongo';
import mongojs from 'mongojs';
import moment from 'moment';

function weeklyUpdate() {
    var api = { run };

    var tt = gameTextModel.textType();
    // get this from the database instead
    const financialInfo = {
        1: { expenses: 1044057, income: 458521, diff: 586000, wealth: 41595000 },
        2: { expenses: 827552, income: 362545, diff: 465000, wealth: 34171000 },
        3: { expenses: 709317, income: 289988, diff: 420000, wealth: 28636000 },
        4: { expenses: 538692, income: 152257, diff: 386000, wealth: 18547000 },
        5: { expenses: 374056, income: 25218, diff: 349000, wealth: 4800500 }
    };

    function run() {
        console.log('finance weekly update started');
        var monitor = new Monitor('weekly-finance');
        var gi = GameInfo.findOne();
        var week = gi.week;
        var cs = gi.season;
        var leagueIdField = 'competitions.natLeague.seasons.' + cs;
        var teams = teamsModel.getActive({_id:1, curmoney:1, [leagueIdField]:1});
        var teamIDs = teams.map(function(team){ return mongojs.ObjectId(team._id._str); });

        var pipe = [
            { $match: {_id: { $in: teamIDs }}},
            { $lookup: {
                from: 'userinfo',
                localField: '_id',
                foreignField: 'team_id',
                as: 'userinfo'
            }},
            { $project: { _id: 1, curmoney:1, [leagueIdField]:1, createdAt: '$userinfo.signed' }},
            { $unwind: '$createdAt' }
        ];

        teams = Teams.aggregate(pipe);
        /* Retransform IDs to generally used format */
        teams = teams.map(function(team){
            team._id = new Mongo.ObjectID(team._id.toString());
            if (team.competitions.natLeague.seasons[cs]) {
                team.lid = new Mongo.ObjectID(team.competitions.natLeague.seasons[cs]._id._str);
            } else {
                // console.log('active team does not have s25', team); //this should not happen
            }
            return team;
        });

        monitor.runAndLogOnList(teams, update, 'Weekly Finance Update');

        function update(team) {
            //the team.lid condition should not be there
            if (team.lid) {
                team.currPos = leaguesModel.teamPosition(team._id, cs, team.lid);
                team.level = team.competitions.natLeague.seasons[cs].level;
                let advertising = getAdvertisingMoney(team);
                let sponsors = getSponsorMoney(team, week);
                let cheerleaders = getCheerleadersMoney(team);
                let salaries = finaceModel.getSalaries(team._id);

                finaceModel.updateWeekly(team, advertising, sponsors, salaries, cheerleaders);
            }
        }

        console.log('finance weekly update ended');
    }

    function getCheerleadersMoney(team) {
        return 0;
    }

    /**
     * Money for advertising. They depend on how rich the club is compared to its competitors from the same league levels
     * @param  {[type]} team [description]
     * @return {[type]}      [description]
     */
    function getAdvertisingMoney(team) {
        var ptg = 0;
        var adPot = 0;
        var bonus = 0;
        var text = {
            tt: tt.finance_advertising, o: 1, v: 1
        };
        var advertising = {
            value: 0,
            text: text
        };

        adPot = financialInfo[team.level].diff / 2;
        ptg = ( team.curmoney / financialInfo[team.level].wealth ) * 100;

        if ( ptg <= 0 )                bonus = 100;
        if ( ptg > 0 && ptg <= 50 )    bonus = 100 - ( 3/2 ) * ptg;
        if ( ptg > 50 && ptg <= 100 )  bonus = 50  - ( ptg/2 );
        if ( ptg > 100 && ptg <= 300 ) bonus = 25  - ( ptg/4 );
        if ( ptg > 300 && ptg <= 400 ) bonus = 100 - ( ptg/2 );
        if ( ptg > 400 )               bonus = -100;

        bonus = bonus / 100;
        advertising.value = adPot + (bonus * adPot);
        advertising.value = Math.round(advertising.value);

        if ( ptg <= 10 )                text.o = 1;
        if ( ptg > 10 && ptg <= 40 )    text.o = 2;
        if ( ptg > 40 && ptg <= 80 )    text.o = 3;
        if ( ptg > 80 && ptg <= 140 )   text.o = 4;
        if ( ptg > 140 && ptg <= 270 )  text.o = 5;
        if ( ptg > 270 && ptg <= 400 )  text.o = 6;
        if ( ptg > 400 )                text.o = 7;

        advertising.text = text;

        return advertising;
    }

    /**
     * Sponsor money are relative to the league position
     * In the first 3 rounds all teams get the same amounts
     * A club that is in its first month of existance, gets the standard sponsor money.
     * Sponsor money come with some messages (
     * Top: You have more friends than ever. Success is a true money magnet but you find yourself yelling 'SHOW ME THE MONEY' in awakward situations.
     * Above middle: You see a glimmer of excitment in your sponsors eyes. Their bet on the underdog can turn into a big payday. Keep up the good work.
     * Middle: The sponsors would like to see more from you before pouring some serious cash.
     * Bottom: Nobody wants your sponsor's products, but not many want to sponsor your relegation fight. A match made in heaven
     * Last places: Sponsors are running away from you. Luckily you had some good lawyer making those contracts pay even in moments like these
     *
     * Early season: The season is young, sponsors know too little, so they're cautiously throwing money at all of you. (https://www.youtube.com/watch?v=wz-PtEJEaqY)
     * New team: You are an unknown, but some sponsors decided to help, hoping you'd get big one day.
     * @param  {[type]} team [description]
     * @return {[type]}      [description]
     */
    function getSponsorMoney(team, week) {
        var adPot = 0;
        var bonus = 0;
        var text = {
            tt: tt.finance_sponsors, o: 1, v: 1
        };
        var sponsors = {
            value: 0,
            text: text
        };
        var createdAt = 0;
        var diff = 0;

        if (typeof team.createdAt === 'string') {
            createdAt = new Date(team.createdAt);
        } else {
            //assume it's a date
            createdAt = team.createdAt;
        }

        adPot = financialInfo[team.level].diff / 2;

        try {
            diff = moment(new Date()).diff(createdAt, 'months');
        } catch (e) {
            console.log('now - createdAt diff error', e);
        }

        if (diff && diff < 1) bonus = butils.math.twoDecs(butils.math.randRange(-6, 6)); text.o = 1;
        if (week < 2) bonus = butils.math.twoDecs(butils.math.randRange(-6, 6)); text.o = 2;

        if (team.currPos === 14) { bonus = -34; text.o = 3; }
        if (team.currPos === 13) { bonus = -21; text.o = 3; }
        if (team.currPos === 12) { bonus = -13; text.o = 3; }

        if (team.currPos === 11) { bonus = -8; text.o = 4; }
        if (team.currPos === 10) { bonus = -5; text.o = 4; }
        if (team.currPos === 9 ) { bonus = -3; text.o = 4; }

        if (team.currPos === 8 ) { bonus = -2; text.o = 5; }
        if (team.currPos === 7 ) { bonus =  2; text.o = 5; }
        if (team.currPos === 6 ) { bonus =  3; text.o = 5; }

        if (team.currPos === 5 ) { bonus =  5; text.o = 6; }
        if (team.currPos === 4 ) { bonus =  8; text.o = 6; }
        if (team.currPos === 3 ) { bonus = 13; text.o = 6; }

        if (team.currPos === 2 ) { bonus = 21; text.o = 7; }
        if (team.currPos === 1 ) { bonus = 34; text.o = 7; }

        sponsors.value = adPot + (adPot * bonus/100);
        sponsors.value = Math.round(sponsors.value);
        sponsors.text = text;

        return sponsors;

    }

    return api;
}

export default weeklyUpdate();