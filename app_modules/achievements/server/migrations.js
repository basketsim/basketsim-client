import leaguesModule from '../../competitions/leagues/server/api.js';
import {Mongo} from 'meteor/mongo';

function migrations() {
    var api = {run, setFPC, decodeHistName, reset, _activeTeamIDs, _getHistoryEvents, _createOldAchievements, _createRecentAchievements, _createAchievement, _awardTrophy, _edgeTeamName};

    /**
     * Get active teams
     * @return {[type]} [description]
     */
    function run() {
        console.log('achievement migration started');

        // var teamIDs = api._activeTeamIDs();
        // - http://localhost:3000/club/55cf114c1cc5f84ae63f7485
        var teamIDs = [new Mongo.ObjectID('55cf11411cc5f84ae63e7c09'), new Mongo.ObjectID('55cf11411cc5f84ae63e859a')];
        var teams = Teams.find({_id: {$in: teamIDs}}, {fields: {name: 1, country:1}});
        var length = teams.count();
        teams.forEach(function (team, i) {
            api._createOldAchievements(api._getHistoryEvents(team), team._id);
            if (i%1000===0) console.log('old achievements created:', i+1, '/', length);
        });

        // api._createRecentAchievements();

        console.log('achievement migration ended');
    }

    function setFPC() {
        console.log('achievement set fpc started');
        History.update({"h_type":10}, {$set: {won:true}}, { multi: true });
        console.log('achievement set fpc ended');
    }

    function decodeHistName() {
        var hist = History.find({won:true}, {fields:{h_teamname: true}});
        var length = hist.count();
        hist.forEach(function (h, i) {
            History.update({_id: h._id}, {$set: {teamname_decoded: utf8_decode(h.h_teamname)}}, function(){});
            if (i%1000===0) console.log('decodeHistName:', i+1, '/', length);
        });
    }
    function reset() {
        console.log('achievement reset started');
        UserInfo.update({}, {$unset: {achievements:''}}, { multi: true });
        console.log('achievement reset ended');

    }

    /**
     * [_getHistoryEvents description]
     * @param  {[type]} team [description]
     * @return {[type]}      [description]
     */
    function _getHistoryEvents(team) {
        var teamName = api._edgeTeamName(team);
        var hist = History.findOne({h_teamname: teamName, user_id:{$ne: '0'}}, {sort:{h_season:-1}, fields:{user_id: true}});
        if (!hist) hist = History.findOne({teamname_decoded: teamName, user_id:{$ne: '0'}}, {sort:{h_season:-1}, fields:{user_id: true}});
        if (!hist) return null;
        var userID = hist.user_id;
        var hEvents = History.find({user_id: userID, won:true},
            {fields: {h_type:1, won:1, h_season:1, h_country:1, h_llevel:1, h_lname:1}}).fetch();

        // if (team.name === 'Bot team no.1') console.log('hEvents', hEvents);
        if (team.name === 'Bot team no.1') console.log('user_id:', userID);
        return hEvents;
    }

    function _edgeTeamName(team) {
        if (team.name === 'Panthers' && team.country === 'Greece') return 'Panionios B.C.';
        if (team.name === 'ClubMalvín ➢') return 'ClubMalvin';
        if (team.name === "G.Lurich\\'i nim. Korvpalliklubi") return "G.Lurich'i nim. Korvpalliklubi";

        return team.name;
    }

    /**
     * Add achievements to the user achievements object
     * achievements: []
     */
    function _createOldAchievements(events, teamID) {
        if (!events) return;

        var s = {
            achievements: []
        };
        _.each(events, function(event){
            s.achievements.push(api._createAchievement(event, teamID));
        });

        UserInfo.update({team_id:teamID}, {$push: {achievements: {$each: s.achievements}}});
    }

    function _createRecentAchievements() {
        var leagues = leaguesModule.get.cursor({},{});
        var length = leagues.count();
        leagues.forEach(function (league, i) {
            _.each(league.seasons, function(season, seasonNum){
                if (parseInt(seasonNum)!==24) {
                    api._awardTrophy(league, season, seasonNum);
                }
            });
            if (i%1000===0) console.log('recent achievements created:', i+1, '/', length);
        });
    }

    function _awardTrophy(league, season, seasonNum) {
        var winner = leaguesModule.get.teamOnPlace(1, season);
        if (!winner) return;
        var achievement = {
            category: 'trophy',
            team: 'personal',
            team_id: winner.team_id,
            type: 'League',
            competition: {
                level: league.level,
                country: league.country,
                season: seasonNum,
                name: league.name
            }
        };

        UserInfo.update({team_id:winner.team_id}, {$push: {achievements: achievement}});
    }

    /**
     * [_createAchievement description]
     *  {
     *      category: trophy/achievement/player_medal
     *      team: personal/international
     *      team_id: team_id
     *      type: League/Cup/Fair Play Cup/Champions Series
     *      competition: {
     *        level: 1/2/3
     *        country: country/international
     *        h_season: seasonNumb,
     *        name: name
     *      }
     *  }
     */
    function _createAchievement(e, teamID) {
        var a = {
            category: _category(e),
            team: _team(e),
            team_id: teamID,
            type: _type(e),
            competition: _competition(e)
        };
        return a;
    }

    function _category(event) {
        switch (event.h_type) {
            case 55:
            return 'achievement';
            case 10:
            return 'achievement';
            default:
            return 'trophy'
        }
    }

    function _team(event) {
        return 'personal';
    }

    function _type(event) {
        var types = {
            1: 'League',
            3: 'Cup',
            5: 'Fair Play Cup',
            6: 'Champions Series',
            7: 'Cup Winners Series',
            10: '10 Fair Play Cup Appearances',
            19: 'Youth Cup World Cup',
            55: '5 years in Basketsim'
        }

        return types[event.h_type];
    }

    function _competition(event) {
        return {
            level: parseInt(event.h_llevel, 10),
            country: event.h_country,
            season: parseInt(event.h_season, 10),
            name: event.h_lname
        }
    }

    function _activeTeamIDs() {
        var teams = Teams.getActiveIDs();
        var teamIDs = [];
        _.each(teams, function(team){
            teamIDs.push(team._id);
        });

        return teamIDs;
    }

    function utf8_decode(str_data) {
      //  discuss at: http://phpjs.org/functions/utf8_decode/
      // original by: Webtoolkit.info (http://www.webtoolkit.info/)
      //    input by: Aman Gupta
      //    input by: Brett Zamir (http://brett-zamir.me)
      // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
      // improved by: Norman "zEh" Fuchs
      // bugfixed by: hitwork
      // bugfixed by: Onno Marsman
      // bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
      // bugfixed by: kirilloid
      //   example 1: utf8_decode('Kevin van Zonneveld');
      //   returns 1: 'Kevin van Zonneveld'

      var tmp_arr = [],
        i = 0,
        ac = 0,
        c1 = 0,
        c2 = 0,
        c3 = 0,
        c4 = 0;

      str_data += '';

      while (i < str_data.length) {
        c1 = str_data.charCodeAt(i);
        if (c1 <= 191) {
          tmp_arr[ac++] = String.fromCharCode(c1);
          i++;
        } else if (c1 <= 223) {
          c2 = str_data.charCodeAt(i + 1);
          tmp_arr[ac++] = String.fromCharCode(((c1 & 31) << 6) | (c2 & 63));
          i += 2;
        } else if (c1 <= 239) {
          // http://en.wikipedia.org/wiki/UTF-8#Codepage_layout
          c2 = str_data.charCodeAt(i + 1);
          c3 = str_data.charCodeAt(i + 2);
          tmp_arr[ac++] = String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
          i += 3;
        } else {
          c2 = str_data.charCodeAt(i + 1);
          c3 = str_data.charCodeAt(i + 2);
          c4 = str_data.charCodeAt(i + 3);
          c1 = ((c1 & 7) << 18) | ((c2 & 63) << 12) | ((c3 & 63) << 6) | (c4 & 63);
          c1 -= 0x10000;
          tmp_arr[ac++] = String.fromCharCode(0xD800 | ((c1 >> 10) & 0x3FF));
          tmp_arr[ac++] = String.fromCharCode(0xDC00 | (c1 & 0x3FF));
          i += 4;
        }
      }

      return tmp_arr.join('');
    }

    return api;
}

export default migrations();