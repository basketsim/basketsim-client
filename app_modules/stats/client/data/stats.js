var statsLabels = ["MC", "EFF","FG","FGA","FG%","3P","3PA","3P%","2P","2PA","2P%","FT",
"FTA","FT%","ORB","DRB","TRB","AST","STL","BLK","TO","FO","PTS"];

var averageable = ["EFF", "FG%", "3P%", "2P%", "FT%"];

var dividable = ["RTG", "FG","FGA","3P","3PA","2P","2PA","FT",
"FTA","ORB","DRB","TRB","AST","STL","BLK","TO","FO","PTS"];

function stats(rawStats) {
    var stats = {
        totals: {},
        perMatch: {},
        per36: {}
    };
    _.each(rawStats, function(seasonObj, seasonNum){
        _statsAddEmptySeason(stats, seasonNum);

        _.each(seasonObj, function(competitionObj, competitionID){
            _statsAddCompetition(stats, competitionObj, competitionID, seasonNum);
        });

        _statsAddSeasonTotals(stats);
        _statsAddSeasonAverages(stats);

        _statsAddAllTotals(stats);
        _statsAddAllAverages(stats);
    });

    return stats;
}

/**
 * Initialize each type of stats for each season
 * @param  {[type]} stats     The stats object to be modified
 * @param  {[type]} seasonNum The number of the season to be initialised
 */
function _statsAddEmptySeason(stats, seasonNum) {
    _.each(stats, function(statType){
        statType[seasonNum] = {
            season: parseInt(seasonNum),
            range: {}
        }
    });
}

function _statsAddCompetition(stats, competition, competitionID, seasonNum) {
    var name = _range(competition);
    _.each(stats, function(statType) {
        statType[seasonNum].range[name] = {
            name: name,
            collection: competition.collection
        }
    });

    stats.totals[seasonNum].range[name].stats = _getStats(competition, statsLabels);
    stats.perMatch[seasonNum].range[name].stats = _getStatsPerMatch(competition, statsLabels);
    stats.per36[seasonNum].range[name].stats = _getStatsPer36(competition, statsLabels);

}
/**
 * Get the totals first and then get per match and per 36
 * @param  {[type]} stats [description]
 * @return {[type]}       [description]
 */
function _statsAddSeasonTotals(stats) {
    _.each(stats.totals, function(season, seasonNum){
        if (typeof season.season === 'number') {
            let seasonTotal = {};
            let totalName = 'S'+seasonNum+' ALL';
            seasonTotal = {
                name: totalName,
                collection: 'SeasonTotals',
                stats: {}
            }

            _.each(season.range, function(competition, compLabel){
                _.each(competition.stats, function(statValue, statKey){
                    if (competition.collection !== 'SeasonTotals') {
                        if (typeof seasonTotal.stats[statKey] === "undefined") seasonTotal.stats[statKey] = 0;
                        seasonTotal.stats[statKey] += statValue;
                    }
                });
            });

            //compute the skills that are not mere totals
            _.each(seasonTotal.stats, function(statVal, statKey){
                if (_.contains(averageable, statKey)) seasonTotal.stats[statKey] = _getPcgOrEff(statKey, seasonTotal.stats);
            });

            season.range[totalName] = seasonTotal;
        }
    });
}

function _statsAddSeasonAverages(stats) {
    var perMatchLabels = ["FG","FGA","3P","3PA","2P","2PA","FT",
"FTA","ORB","DRB","TRB","AST","STL","BLK","TO","FO","PTS"];

    _.each(stats.totals, function(season, seasonNum){
        if (typeof season.season === 'number') {
            let name = 'S'+seasonNum+' ALL';
            let ts = season.range[name].stats;

            stats.perMatch[seasonNum].range[name] = {};
            stats.per36[seasonNum].range[name] = {};

            var pmr = stats.perMatch[seasonNum].range[name];
            var p36r = stats.per36[seasonNum].range[name];

            _.each([pmr, p36r], function(ref){
                ref.name = name;
                ref.collection = 'SeasonAverages';
                ref.stats = {};
            });

            //copy the totals first
            _.each(ts, function(statVal, statKey) {
                pmr.stats[statKey] = statVal;
            });

            //do the averages
            _.each(perMatchLabels, function(key){
                pmr.stats[key] = butils.math.twoDecs(ts[key]/ ts.MC);
            });
        }
    });
}

function _getPcgOrEff(statKey, stats) {
    var pcg = {
        "EFF": _eff(stats),
        "FG%": _getPercentage(stats.FG, stats.FGA),
        "3P%": _getPercentage(stats['3P'], stats['3PA']),
        "2P%": _getPercentage(stats['2P'], stats['2PA']),
        "FT%": _getPercentage(stats['FT'], stats['FTA'])
    }

    return pcg[statKey];
}

function _getPercentage(part, total) {
    if (total === 0) return 0;
    return butils.math.oneDec((part/total)*100);
}

function _statsAddAllTotals(stats) {
    var all = _initAll();

    _.each(stats.totals, function(season){
        if (typeof season.season === 'number') {
            _.each(season.range, function(competition){
                if (_.contains(['Leagues', 'NationalCups'], competition.collection)) {
                    _.each(competition.stats, function(statValue, statKey){
                        if (typeof all.range[competition.collection].stats[statKey] === "undefined") all.range[competition.collection].stats[statKey] = 0;
                        if (typeof all.range.Totals.stats[statKey] === 'undefined') all.range.Totals.stats[statKey] = 0;

                        all.range[competition.collection].stats[statKey] += statValue;
                        all.range.Totals.stats[statKey] += statValue;
                    });

                    //compute the skills that are not mere totals
                    _.each(all.range[competition.collection].stats, function(statVal, statKey){
                        if (_.contains(averageable, statKey)) all.range[competition.collection].stats[statKey] = _getPcgOrEff(statKey, all.range[competition.collection].stats);
                    });
                }
            });
        }
    });

    //compute the skills that are not mere totals
    _.each(all.range.Totals.stats, function(statVal, statKey){
        if (_.contains(averageable, statKey)) all.range.Totals.stats[statKey] = _getPcgOrEff(statKey, all.range.Totals.stats);
    });

    stats.totals.all = all;
}

function _statsAddAllAverages(stats) {
    var perMatchLabels = ["FG","FGA","3P","3PA","2P","2PA","FT",
"FTA","ORB","DRB","TRB","AST","STL","BLK","TO","FO","PTS"];
    var allPerMatch = _initAll();
    var allPer36 = _initAll();

    _.each([allPer36, allPerMatch], function(all){
        //first copy the stats
        _.each(stats.totals.all.range, function(competition, competitionLabel) {
            _.each(competition.stats, function(statValue, statLabel){
                all.range[competitionLabel].stats[statLabel] = statValue;
            });
        });
    });

    //Obtain the average per match
    _.each(allPerMatch.range, function(competition, competitionLabel){
        _.each(perMatchLabels, function(stat){
            competition.stats[stat] = butils.math.twoDecs(competition.stats[stat] / competition.stats.MC)
        });
    });

    //Obtain the average per 36
    // _.each(allPerMatch.range, function(competition, competitionLabel){
    //     _.each(perMatchLabels, function(stat){
    //         competition.stats[stat] = butils.math.twoDecs(competition.stats[stat] / competition.stats.MC)
    //     });
    // });
    //
    stats.perMatch.all = allPerMatch;
    stats.per36.all = allPer36;

}

function _initAll() {
    var all = {
        range: {
            'Leagues': {
                collection: 'Leagues',
                name: 'All League',
                stats: {}
            },
            'NationalCups': {
                collection: 'NationalCups',
                name: 'All Cup',
                stats: {}
            },
            'Totals': {
                collection: 'Totals',
                name: 'Total',
                stats: {}
            }
        }
    };

    return all;
}

function _getStats(competition, statsArray) {
    var stats = {};
    _.each(statsArray, function(stat){
        stats[stat] = _getStat(stat, competition)
    });

    return stats;
}

function _getStatsPerMatch(competition, statsArray) {
    var perMatchLabels = ["FG","FGA","3P","3PA","2P","2PA","FT",
"FTA","ORB","DRB","TRB","AST","STL","BLK","TO","FO","PTS"];
    var stats = _getStats(competition, statsArray);

    _.each(perMatchLabels, function(key){
        stats[key] = butils.math.twoDecs(stats[key]/ stats.MC);
    });

    return stats;
}

function _getStatsPer36(competition, statsArray) {
//     var perMatchLabels = ["FG","FGA","3P","3PA","2P","2PA","FT",
// "FTA","ORB","DRB","TRB","AST","STL","BLK","TO","FO","PTS"];
//     var stats = _getStats(competition, statsArray);

//     _.each(perMatchLabels, function(key){
//         stats[key] = butils.math.twoDecs(stats[key]*36/ stats.minutes);
//     });

//     return stats;
        return {};
}

function _getStat(stat, competition) {
    var s = competition.stats;

    var sts = {
        "MC": s.matches,
        "EFF": 0,
        "FG": _fg(s),
        "FGA": _fga(s),
        "FG%": _fgp(s),
        "3P": _converted(s.threePoints),
        "3PA": _attempted(s.threePoints),
        "3P%": _percentage(s.threePoints),
        "2P": _converted(s.twoPoints),
        "2PA": _attempted(s.twoPoints),
        "2P%": _percentage(s.twoPoints),
        "FT": _converted(s.freeThrows),
        "FTA": _attempted(s.freeThrows),
        "FT%": _percentage(s.freeThrows),
        "ORB": s.rebounds.offensive,
        "DRB": s.rebounds.defensive,
        "TRB": (s.rebounds.offensive + s.rebounds.defensive),
        "AST": s.assists,
        "STL": s.steals,
        "BLK": s.blocks,
        "TO": s.turnovers,
        "FO": s.fouls,
        "PTS": _pt(s)
    }
    sts.EFF = _eff(sts);

    return sts[stat];
}

function _converted(stat) {
    return stat.converted;
}

function _attempted(stat) {
    return stat.converted + stat.missed;
}

function _percentage(stat) {
    if (_attempted(stat) === 0) return 0;
    return butils.math.oneDec((_converted(stat)/_attempted(stat))*100);
}

function _fg(s) {
    return s.twoPoints.converted + s.threePoints.converted;
}

function _fga(s) {
    return s.twoPoints.converted + s.twoPoints.missed + s.threePoints.converted + s.threePoints.missed;
}

function _fgp(s) {
    if (_fga(s) === 0) return 0;
    return butils.math.oneDec((_fg(s)/_fga(s))*100);
}

function _pt(s) {
    return s.freeThrows.converted + s.twoPoints.converted*2 + s.threePoints.converted*3;
}

function _eff(r) {
    var points = r.FT + r['2P'] * 2 + r['3P'] * 3;
    var rebs = r.TRB;
    var missedfg = r.FGA - r.FG;
    var missedft = r.FTA - r.FT;

    var eff = points + rebs + r.AST + r.STL + r.BLK - missedfg - missedft - r.TO;
    eff = butils.math.oneDec(eff/r.MC);

    if (r.MC === 0) eff = 0;

    return eff;
}

function _range(competitionObj) {
    var comp = '';

    switch (competitionObj.collection) {
        case 'Leagues':
        comp = butils.countryCode(competitionObj.country) + ' ' + competitionObj.name;
        break;
        case 'NationalCups':
        comp = butils.countryCode(competitionObj.country) + ' Cup';
        break;
        case 'Playoffs':
        comp = 'Playoffs'
        break;
        default:
        comp = 'Other';
        break;
    }

    return comp;
}

export default stats;
