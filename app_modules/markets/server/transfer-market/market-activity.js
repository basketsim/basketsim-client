import teamsModel from './../../../teams/server/models/team-datamodel';
import _ from 'underscore';
import {Mongo} from 'meteor/mongo';
import {MarketActivity} from './../../../../collections/collections.js';
import UserInfo from './../../../../collections/UserInfo.js';

function marketActivity() {
    var api = {insertAll, insert, insertByTeamID, insertByClubID, _create, reset, insertMissing};

    function insertAll() {
        var clubs = UserInfo.find().fetch();
        _.each(clubs, function(club, i){
            MarketActivity.insert(api._create(club._id, club.team_id));
        });
    }

    function insertMissing() {
        const teams = teamsModel.getActive({_id: 1});
        const teamIDs = teams.map((team) => { return team._id._str; });
        const marketActivities = MarketActivity.find({}, {fields: {team_id:1}}).fetch();
        const maIDs = marketActivities.map((ma) => { return ma.team_id._str; });

        const teamIDStrsWithoutMarketActiviy = _.difference(teamIDs, maIDs);
        const teamIDsToInsert = teamIDStrsWithoutMarketActiviy.map((str) => {return new Mongo.ObjectID(str); });

        const userInfos = UserInfo.find({team_id: {$in: teamIDsToInsert}}, {fields: {_id: 1, team_id:1 }});

        console.log('insert missing marketactivity', userInfos.count());
        userInfos.forEach((userinfo) => {
            api.insert(userinfo._id, userinfo.team_id);
        });
    }

    function insert(clubID, teamID) {
        MarketActivity.insert(api._create(clubID, teamID));
    }

    function reset(teamID) {
        const userinfoID = UserInfo.findOne({team_id: teamID}, {fields:{_id:1}})._id;
        MarketActivity.remove({team_id: teamID}, function () {
            MarketActivity.insert(api._create(userinfoID, teamID));
        });
    }

    function insertByTeamID() {

    }

    function insertByClubID() {

    }

    function _create(club_id, team_id) {
        var activity = {
            club_id: club_id,
            team_id: team_id,
            createdAt: moment().valueOf(),
            bids: [],
            transfers: {
                sold: [],
                bought: []
            },
            penalties: {
                 flaggedByCommunity: [],
                 flaggedByAdmin: [],
                 warnings: [],
                 priceCorrections: [],
                 fines: [],
                 revertedTransfers: []
            }
        };

        return activity;
    }

    return api;
}

export default marketActivity();