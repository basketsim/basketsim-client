Template.TeamSummary.onCreated(function(){

});

Template.TeamSummary.helpers({
    stats: function () {
        var tpl = Template.instance();
        var sts = {
            homeStats: getStats('homeTeam'),
            awayStats: getStats('awayTeam')
        };
        sts.homeRatio = comparedStats('home', sts.homeStats, sts.awayStats);
        sts.awayRatio = comparedStats('away', sts.homeStats, sts.awayStats);

        sanitizeRatios(sts.homeRatio, sts.awayRatio);
        return sts;
    }
});

function getStats(side) {
    var tpl = Template.instance();
    var match = tpl.data.match;

    var r = match[side].matchRatings;

    var stats = {
        twoPoints: {
            converted: r.twoPoints.converted,
            total: total(side, 'twoPoints'),
            percentage: percentage(side, 'twoPoints')
        },
        threePoints: {
            converted: r.threePoints.converted,
            total: total(side, 'threePoints'),
            percentage: percentage(side, 'threePoints')
        },
        freeThrows: {
            converted: r.freeThrows.converted,
            total: total(side, 'freeThrows'),
            percentage: percentage(side, 'freeThrows')
        },
        rebounds: {
            defensive: r.rebounds.defensive,
            offensive: r.rebounds.offensive,
            total: r.rebounds.defensive + r.rebounds.offensive
        },
        assists: r.assists,
        fouls: r.fouls,
        steals: r.steals,
        turnovers: r.turnovers,
        blocks: r.blocks
    };

    return stats;
}


function comparedStats(side, homeStats, awayStats) {
    //side = home or away
    var stats = {
        twoPoints: per(side, homeStats.twoPoints.converted, awayStats.twoPoints.converted),
        twoPointsPercentage: per(side, homeStats.twoPoints.percentage, awayStats.twoPoints.percentage),
        threePoints: per(side, homeStats.threePoints.converted, awayStats.threePoints.converted),
        threePointsPercentage: per(side, homeStats.threePoints.percentage, awayStats.threePoints.percentage),
        freeThrows: per(side, homeStats.freeThrows.converted, awayStats.freeThrows.converted),
        freeThrowsPercentage: per(side, homeStats.freeThrows.percentage, awayStats.freeThrows.percentage),
        rebounds: per(side, homeStats.rebounds.total, awayStats.rebounds.total),
        assists: per(side, homeStats.assists, awayStats.assists),
        fouls: per(side, homeStats.fouls, awayStats.fouls),
        steals: per(side, homeStats.steals, awayStats.steals),
        turnovers: per(side, homeStats.turnovers, awayStats.turnovers),
        blocks: per(side, homeStats.blocks, awayStats.blocks),
    };
    return stats;
}

function per(side, homeval, awayval) {
    var total = homeval + awayval;
    var homePer = Math.round(homeval/total * 100);
    var awayPer = Math.round(awayval/total * 100);

    if (total === 0) {
        awayPer = 0;
        homePer = 0;
    }
    if (side==='home') {
        return homePer;
    } else if (side==='away') {
        return awayPer;
    }

}

function sanitizeRatios(home, away) {
    for (var prop in home) {
        if (home[prop] + away[prop] > 100) {
            home[prop] = home[prop] - 0.5;
            away[prop] = away[prop] - 0.5;
        }
        if (home[prop] === away[prop] && home[prop] === 0) {
            home[prop] = away[prop] = 50;
        }
    }
}

function total(side, stat) {
    var tpl = Template.instance();
    var match = tpl.data.match;
    var ratings = match[side].matchRatings;
    return ratings[stat].converted + ratings[stat].missed;
}

function percentage(side, stat) {
    var tpl = Template.instance();
    var match = tpl.data.match;
    var ratings = match[side].matchRatings;
    var perc = 0;
    perc = (ratings[stat].converted/ (ratings[stat].converted + ratings[stat].missed)) * 100;
    if (isNaN(perc)) perc = 0;
    perc = Math.round(perc * 10) / 10;
    return perc;
}