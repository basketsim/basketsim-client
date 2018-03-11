Meteor.methods({
    'migrationUpdate': function () {
        migrationUpdate();
    },
    'migrateTraining': function() {
        migrateTraining();
    },
    'decodeUtf': function() {
        decodeUtf();
    },
    'restructureDates': function() {
      restructureDates();
    },
    'updatePlayerSkills': updatePlayerSkills, //done
    'formatCharacter': formatCharacter, //done
    'migrateTrainers': migrateTrainers,
    'userForumPreferences': userForumPreferences,

});
/**
 * Restrucure the dates, but have the following schedule:
 * Monday: Cup
 * Tuesday: Newbs Cup/ Friendly Cups for supporters
 * Wednsday: League
 * Thursday: CWS/CS
 * Friday: FPC + NT Matches
 * Saturday: League Games
 * Sunday: Inferior League Cup/ Friendly Cups for supporters
 */
function userForumPreferences () {
    // Meteor.http.call("GET",'http://162.243.214.47/users/goosy/preferences.json?api_key=ab7794cbaa2aef1940fddf7c00fb50598908ec35f0cd4115d1b0c83170d02d1b&api_username=goosy', function (error, result) {
    //     console.log(error, result);
    // });
    // Meteor.http.call("GET",'http://162.243.214.47/users/goosy.json?api_key=ab7794cbaa2aef1940fddf7c00fb50598908ec35f0cd4115d1b0c83170d02d1b&api_username=goosy', function (error, result) {
    //     console.log(error, result /*result.data.user.muted_category_ids*/);
    // });
    Meteor.http.call("PUT",'http://162.243.214.47/users/exttest?api_key=ab7794cbaa2aef1940fddf7c00fb50598908ec35f0cd4115d1b0c83170d02d1b&api_username=goosy', {
      data: {
        tracked_category_ids: [22,23,24,25]
        // muted_category_ids: [17,18,19,20]
      }
    }, function (error, result) {
        console.log(error, result /*result.data.user.muted_category_ids*/);
    });


}
function restructureDates() {
  var dates = Dates.find().fetch();
  _.each(dates, function(date){
    Dates.update({_id:date._id}, {$set:{
      natLeagues: [{day: 6, time: date.date1}, {day: 3, time: date.date2}], //league matches on saturday and wednsday
      cup: [{day: 1, time: date.date2}], //cup matches on mondays
    }});
  });
}

function migrateTraining() {
    console.log('migrate training start');
    var teams = Teams.find().fetch();
    var training = {};
    var skills = ['No training', 'Handling', 'Quickness', 'Passing', 'Dribbling', 'Rebounds', 'Positioning', 'Shooting',
    'Freethrows', 'Defense'];
    var intensity = ['Leisure', 'Normal', 'Intense', 'Immense'];
    _.each(teams, function(team){
        training = {
            guards: {
                intensity: intensity[team.intensity],
                type: skills[team.guards_t],
                players: [],
            },
            bigMen: {
                intensity: intensity[team.intensity2],
                type: skills[team.bigmen_t],
                players: [],
            }
        };
        Teams.update({_id: team._id}, {$set:{training:training}});
    });
    console.log('migrate training done');
}

function updatePlayerSkills() {
  console.log('player update started');
  var time = Date.now();
  var players;

  var count = Players.find().count();

  for (var i=0; i<count; i+=10000) {
    players = Players.find({}, {
      skip: i,
      limit: 10000
    }).fetch();

    console.log('counter got to', i);

    _.each(players, function(player){
      Players.update({_id:player._id}, {
        $set: {
          dribbling: player.vision,
          positioning: player.position,
          quickness: player.speed
        }
      }, {multi:true});
    });
  }

  console.log('update Player Skills in', (Date.now() - time)/1000, ' seconds');
}

function decodeUtf() {
    console.log('decode utf started');
    decodeArenas();
    console.log('decode arena done');
    decodeTeams();
    console.log('decode teams done');
}

function decodeTeams() {
    var teams = Teams.find().fetch();
    _.each(teams, function(team){
        Teams.update({_id: team._id}, {
          $set:{
            name: utf8_decode(team.name),
            short_name: utf8_decode(team.short_name),
            arena_name: utf8_decode(team.arena_name),
            city: utf8_decode(team.city),
            country: utf8_decode(team.country)
        }
      });
    });
}

function decodeArenas() {
    var it = 0;
    var arenas = Arenas.find().fetch();
    _.each(arenas, function(arena){
        Arenas.update({_id: arena._id}, {$set:{
            arenaname: utf8_decode(arena.arenaname)
        }});
    });
}

function formatCharacter() {
    var players= Players.find().fetch();
    var character = '';

    _.each(players, function(player){
          if (player.charac < 4) { character = 'stable'; }
          else if (player.charac > 3 && player.charac < 7) { character = 'entertaining'; }
          else if (player.charac > 6 && player.charac < 11) { character = 'calm'; }
          else if (player.charac > 10 && player.charac < 14) { character = 'aggressive'; }
          else if (player.charac > 13 && player.charac < 17) { character = 'controversial'; }
          else if (player.charac > 16 && player.charac < 20) { character = 'selfish'; }
          else if (player.charac > 19 && player.charac < 23) { character ='dirty'; }
          else if (player.charac > 22 && player.charac < 26) { character ='clumsy'; }
          else if (player.charac > 25 && player.charac < 30) { character ='explosive'; }
          else if (player.charac > 29 && player.charac < 33) { character ='loyal'; }
          else if (player.charac > 32 && player.charac < 35) { character ='wise'; }
          else if (player.charac > 34 && player.charac < 39) { character ='fragile'; }
          else if (player.charac > 38 && player.charac < 41) { character ='tough'; }
          else if (player.charac > 40 && player.charac < 44) { character ='lazy'; }

        Players.update({_id: player._id}, {
          $set: {
            character: character
          }
        });
    });
}

function migrateTrainers() {
  console.log('migrate trainers happenenad');
    var coaches= Players.find({coach: 1}).fetch();
    var wwy = '';

    _.each(coaches, function(player){
        switch (true) {
        case (player.quality < 43): wwy = 'pathetic'; break;
        case (player.quality > 42 && player.quality < 46): wwy = 'poor'; break;
        case (player.quality > 45 && player.quality < 49): wwy = 'average'; break;
        case (player.quality > 48 && player.quality < 52): wwy = 'good'; break;
        case (player.quality > 51 && player.quality < 55): wwy = 'great'; break;
        case (player.quality > 54 && player.quality < 58): wwy = 'fantastic'; break;
        case (player.quality > 57): wwy = 'extraordinary'; break;
        }

        Players.update({_id: player._id}, {
          $set: {
            wwy: wwy
          }
        });
    });
    console.log('migrate trainers complete');

}

function migrationUpdate() {
    console.log('migration update started');
    var time = Date.now();
    // updatePlayerSkills();
    // formatCharacter();
    migrateTraining();
    // decodeUtf();
    console.log('migration update finished in', time);

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