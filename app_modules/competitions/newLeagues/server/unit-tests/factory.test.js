import faker from 'faker';
import { Mongo } from 'meteor/mongo';

function factory() {
    var api = {leagueTeam, league, createLeague, season, orderedSeason, seasonFactory};

    function leagueTeam() {
        return {
            "_id": new Mongo.ObjectID(),
            "team_id": new Mongo.ObjectID(),
            "name": faker.name.findName(),
            "season": 24,
            "position": 2,
            "played": 0,
            "win": 0,
            "lose": 0,
            "scored": 0,
            "against": 0,
            "difference": 0,
            "lastpos": 2
        }
    }

    function league() {
        return {
            "_id": {_str: "55cf04f11cc5f84ae61f0996"},
            "name": "1",
            "country": "Romania",
            "level": 1,
            "change": 0,
            "strength": 145,
            "active": 1,
            "seasons": {
                23: season(),
                24: season()
            }
        }
    }

    /**
     * [seasonFactory description]
     * @param  {args} listsOfTeams For each team, pass an array with [win, diff, scored, 3-digit-id]
     * @return {[type]}             [description]
     */
    function seasonFactory() {
        var teams = _.map(arguments, function(results, i){
            function makeid(letter) {
                var id = '';
                var idLength = 24;
                idLength = 24 - results[3].length;
                for (var i=0; i<idLength; i++) {
                    id = id + letter;
                }
                let finalID = id + results[3];
                return id + results[3];
            }

            return {
                _id: new Mongo.ObjectID(makeid('a')),
                team_id: new Mongo.ObjectID(makeid('b')),
                name: results[3],
                win: results[0],
                difference: results[1],
                scored: results[2]
            }
        });

        return {
            teams: teams
        }
    }

    function createLeague(country, level, seasonNum, season) {
        var league = {
            country: country,
            level: level,
            seasons: {}
        }

        league.seasons[seasonNum] = season;
        return league;
    }

    function season() {
        return {
            "teams": [
                {
                    "_id": {
                        "_str": "55cf113f1cc5f84ae63e4b4d"
                    },
                    "team_id": {
                        "_str": "55cf113f1cc5f84ae63e4b4d"
                    },
                    "name": "Costin's Devils",
                    "season": 23,
                    "position": 1,
                    "played": 26,
                    "win": 11,
                    "lose": 15,
                    "scored": 2000,
                    "against": 1650,
                    "difference": -350,
                    "lastpos": 1
                },
                {
                    "_id": {
                        "_str": "55cf113f1cc5f84ae63e4b00"
                    },
                    "team_id": {
                        "_str": "55cf113f1cc5f84ae63e4b00"
                    },
                    "name": "All Star Ploiesti",
                    "season": 23,
                    "position": 1,
                    "played": 26,
                    "win": 16,
                    "lose": 10,
                    "scored": 1534,
                    "against": 1529,
                    "difference": 5,
                    "lastpos": 1
                },
                {
                    "_id": {
                        "_str": "55cf11431cc5f84ae63e9c7b"
                    },
                    "team_id": {
                        "_str": "55cf11431cc5f84ae63e9c7b"
                    },
                    "name": "Red Stars Bucharest",
                    "season": 23,
                    "position": 1,
                    "played": 26,
                    "win": 9,
                    "lose": 17,
                    "scored": 1596,
                    "against": 1774,
                    "difference": -178,
                    "lastpos": 1
                },
                {
                    "_id": {
                        "_str": "55cf113f1cc5f84ae63e4b13"
                    },
                    "team_id": {
                        "_str": "55cf113f1cc5f84ae63e4b13"
                    },
                    "name": "politehnica timisoara",
                    "season": 23,
                    "position": 1,
                    "played": 26,
                    "win": 21,
                    "lose": 5,
                    "scored": 2273,
                    "against": 1408,
                    "difference": 865,
                    "lastpos": 1
                },
                {
                    "_id": {
                        "_str": "55cf113f1cc5f84ae63e4ad8"
                    },
                    "team_id": {
                        "_str": "55cf113f1cc5f84ae63e4ad8"
                    },
                    "name": "West Petrom Arad",
                    "season": 23,
                    "position": 1,
                    "played": 26,
                    "win": 22,
                    "lose": 4,
                    "scored": 2084,
                    "against": 1393,
                    "difference": 691,
                    "lastpos": 1
                },
                {
                    "_id": {
                        "_str": "55cf113f1cc5f84ae63e4b64"
                    },
                    "team_id": {
                        "_str": "55cf113f1cc5f84ae63e4b64"
                    },
                    "name": "Bookmakers",
                    "season": 23,
                    "position": 1,
                    "played": 26,
                    "win": 11,
                    "lose": 15,
                    "scored": 1900,
                    "against": 1550,
                    "difference": -350,
                    "lastpos": 1
                },
                {
                    "_id": {
                        "_str": "55cf11431cc5f84ae63e9c9f"
                    },
                    "team_id": {
                        "_str": "55cf11431cc5f84ae63e9c9f"
                    },
                    "name": "BC Flyers Galati",
                    "season": 23,
                    "position": 1,
                    "played": 26,
                    "win": 14,
                    "lose": 12,
                    "scored": 1641,
                    "against": 1852,
                    "difference": -211,
                    "lastpos": 1
                },
                {
                    "_id": {
                        "_str": "55cf113f1cc5f84ae63e4ac4"
                    },
                    "team_id": {
                        "_str": "55cf113f1cc5f84ae63e4ac4"
                    },
                    "name": "BC Grivitsa Wolves",
                    "season": 23,
                    "position": 1,
                    "played": 26,
                    "win": 26,
                    "lose": 0,
                    "scored": 2376,
                    "against": 1527,
                    "difference": 849,
                    "lastpos": 1
                },
                {
                    "_id": {
                        "_str": "55cf113f1cc5f84ae63e4afe"
                    },
                    "team_id": {
                        "_str": "55cf113f1cc5f84ae63e4afe"
                    },
                    "name": "Steaua BucureÈ™ti",
                    "season": 23,
                    "position": 1,
                    "played": 26,
                    "win": 4,
                    "lose": 22,
                    "scored": 1413,
                    "against": 1867,
                    "difference": -454,
                    "lastpos": 1
                },
                {
                    "_id": {
                        "_str": "55cf113f1cc5f84ae63e4b04"
                    },
                    "team_id": {
                        "_str": "55cf113f1cc5f84ae63e4b04"
                    },
                    "name": "London Gargoyles",
                    "season": 23,
                    "position": 1,
                    "played": 26,
                    "win": 8,
                    "lose": 18,
                    "scored": 1452,
                    "against": 1743,
                    "difference": -291,
                    "lastpos": 1
                },
                {
                    "_id": {
                        "_str": "55cf11431cc5f84ae63e9bc5"
                    },
                    "team_id": {
                        "_str": "55cf11431cc5f84ae63e9bc5"
                    },
                    "name": "BC Tonea",
                    "season": 23,
                    "position": 1,
                    "played": 26,
                    "win": 21,
                    "lose": 5,
                    "scored": 2322,
                    "against": 1709,
                    "difference": 613,
                    "lastpos": 1
                },
                {
                    "_id": {
                        "_str": "55cf113f1cc5f84ae63e4b58"
                    },
                    "team_id": {
                        "_str": "55cf113f1cc5f84ae63e4b58"
                    },
                    "name": "Armo",
                    "season": 23,
                    "position": 1,
                    "played": 26,
                    "win": 8,
                    "lose": 18,
                    "scored": 1424,
                    "against": 1812,
                    "difference": -388,
                    "lastpos": 1
                },
                {
                    "_id": {
                        "_str": "55cf11431cc5f84ae63e9cb3"
                    },
                    "team_id": {
                        "_str": "55cf11431cc5f84ae63e9cb3"
                    },
                    "name": "Bot team no.131",
                    "season": 23,
                    "position": 1,
                    "played": 26,
                    "win": 6,
                    "lose": 20,
                    "scored": 1484,
                    "against": 1981,
                    "difference": -497,
                    "lastpos": 1
                },
                {
                    "_id": {
                        "_str": "55cf113f1cc5f84ae63e4b1f"
                    },
                    "team_id": {
                        "_str": "55cf113f1cc5f84ae63e4b1f"
                    },
                    "name": "CSU Asesoft Ploiesti",
                    "season": 23,
                    "position": 1,
                    "played": 26,
                    "win": 6,
                    "lose": 20,
                    "scored": 1447,
                    "against": 1862,
                    "difference": -415,
                    "lastpos": 1
                }
            ],
            "state": {
                "round": 27,
                "matchesPlayed": 0,
                "regularEnded": true
            }
        }
    }

    function orderedSeason() {
        return {
            "teams": [
                {
                    "_id": {
                        "_str": "55cf113f1cc5f84ae63e4ac4"
                    },
                    "team_id": {
                        "_str": "55cf113f1cc5f84ae63e4ac4"
                    },
                    "name": "BC Grivitsa Wolves",
                    "season": 23,
                    "position": 1,
                    "played": 26,
                    "win": 26,
                    "lose": 0,
                    "scored": 2376,
                    "against": 1527,
                    "difference": 849,
                    "lastpos": 1
                },
                {
                    "_id": {
                        "_str": "55cf113f1cc5f84ae63e4ad8"
                    },
                    "team_id": {
                        "_str": "55cf113f1cc5f84ae63e4ad8"
                    },
                    "name": "West Petrom Arad",
                    "season": 23,
                    "position": 1,
                    "played": 26,
                    "win": 22,
                    "lose": 4,
                    "scored": 2084,
                    "against": 1393,
                    "difference": 691,
                    "lastpos": 1
                },
                {
                    "_id": {
                        "_str": "55cf113f1cc5f84ae63e4b13"
                    },
                    "team_id": {
                        "_str": "55cf113f1cc5f84ae63e4b13"
                    },
                    "name": "politehnica timisoara",
                    "season": 23,
                    "position": 1,
                    "played": 26,
                    "win": 21,
                    "lose": 5,
                    "scored": 2273,
                    "against": 1408,
                    "difference": 865,
                    "lastpos": 1
                },
                {
                    "_id": {
                        "_str": "55cf11431cc5f84ae63e9bc5"
                    },
                    "team_id": {
                        "_str": "55cf11431cc5f84ae63e9bc5"
                    },
                    "name": "BC Tonea",
                    "season": 23,
                    "position": 1,
                    "played": 26,
                    "win": 21,
                    "lose": 5,
                    "scored": 2322,
                    "against": 1709,
                    "difference": 613,
                    "lastpos": 1
                },
                {
                    "_id": {
                        "_str": "55cf113f1cc5f84ae63e4b00"
                    },
                    "team_id": {
                        "_str": "55cf113f1cc5f84ae63e4b00"
                    },
                    "name": "All Star Ploiesti",
                    "season": 23,
                    "position": 1,
                    "played": 26,
                    "win": 16,
                    "lose": 10,
                    "scored": 1534,
                    "against": 1529,
                    "difference": 5,
                    "lastpos": 1
                },
                {
                    "_id": {
                        "_str": "55cf11431cc5f84ae63e9c9f"
                    },
                    "team_id": {
                        "_str": "55cf11431cc5f84ae63e9c9f"
                    },
                    "name": "BC Flyers Galati",
                    "season": 23,
                    "position": 1,
                    "played": 26,
                    "win": 14,
                    "lose": 12,
                    "scored": 1641,
                    "against": 1852,
                    "difference": -211,
                    "lastpos": 1
                },
                {
                    "_id": {
                        "_str": "55cf113f1cc5f84ae63e4b4d"
                    },
                    "team_id": {
                        "_str": "55cf113f1cc5f84ae63e4b4d"
                    },
                    "name": "Costin's Devils",
                    "season": 23,
                    "position": 1,
                    "played": 26,
                    "win": 11,
                    "lose": 15,
                    "scored": 2000,
                    "against": 1650,
                    "difference": -350,
                    "lastpos": 1
                },
                {
                    "_id": {
                        "_str": "55cf113f1cc5f84ae63e4b64"
                    },
                    "team_id": {
                        "_str": "55cf113f1cc5f84ae63e4b64"
                    },
                    "name": "Bookmakers",
                    "season": 23,
                    "position": 1,
                    "played": 26,
                    "win": 11,
                    "lose": 15,
                    "scored": 1900,
                    "against": 1550,
                    "difference": -350,
                    "lastpos": 1
                },
                {
                    "_id": {
                        "_str": "55cf11431cc5f84ae63e9c7b"
                    },
                    "team_id": {
                        "_str": "55cf11431cc5f84ae63e9c7b"
                    },
                    "name": "Red Stars Bucharest",
                    "season": 23,
                    "position": 1,
                    "played": 26,
                    "win": 9,
                    "lose": 17,
                    "scored": 1596,
                    "against": 1774,
                    "difference": -178,
                    "lastpos": 1
                },
                {
                    "_id": {
                        "_str": "55cf113f1cc5f84ae63e4b04"
                    },
                    "team_id": {
                        "_str": "55cf113f1cc5f84ae63e4b04"
                    },
                    "name": "London Gargoyles",
                    "season": 23,
                    "position": 1,
                    "played": 26,
                    "win": 8,
                    "lose": 18,
                    "scored": 1452,
                    "against": 1743,
                    "difference": -291,
                    "lastpos": 1
                },
                {
                    "_id": {
                        "_str": "55cf113f1cc5f84ae63e4b58"
                    },
                    "team_id": {
                        "_str": "55cf113f1cc5f84ae63e4b58"
                    },
                    "name": "Armo",
                    "season": 23,
                    "position": 1,
                    "played": 26,
                    "win": 8,
                    "lose": 18,
                    "scored": 1424,
                    "against": 1812,
                    "difference": -388,
                    "lastpos": 1
                },
                {
                    "_id": {
                        "_str": "55cf113f1cc5f84ae63e4b1f"
                    },
                    "team_id": {
                        "_str": "55cf113f1cc5f84ae63e4b1f"
                    },
                    "name": "CSU Asesoft Ploiesti",
                    "season": 23,
                    "position": 1,
                    "played": 26,
                    "win": 6,
                    "lose": 20,
                    "scored": 1447,
                    "against": 1862,
                    "difference": -415,
                    "lastpos": 1
                },
                {
                    "_id": {
                        "_str": "55cf11431cc5f84ae63e9cb3"
                    },
                    "team_id": {
                        "_str": "55cf11431cc5f84ae63e9cb3"
                    },
                    "name": "Bot team no.131",
                    "season": 23,
                    "position": 1,
                    "played": 26,
                    "win": 6,
                    "lose": 20,
                    "scored": 1484,
                    "against": 1981,
                    "difference": -497,
                    "lastpos": 1
                },
                {
                    "_id": {
                        "_str": "55cf113f1cc5f84ae63e4afe"
                    },
                    "team_id": {
                        "_str": "55cf113f1cc5f84ae63e4afe"
                    },
                    "name": "Steaua BucureÈ™ti",
                    "season": 23,
                    "position": 1,
                    "played": 26,
                    "win": 4,
                    "lose": 22,
                    "scored": 1413,
                    "against": 1867,
                    "difference": -454,
                    "lastpos": 1
                }
            ],
            "state": {
                "round": 27,
                "matchesPlayed": 0,
                "regularEnded": true
            }
        }
    }

    return api;
}

export default factory();