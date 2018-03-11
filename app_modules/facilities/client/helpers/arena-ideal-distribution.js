/**
 * Makes an ideal distribution based on the total seats + increase.
 * Compares it against current distribution and returns the difference of seats that need to be added for reaching ideal
 * @param arena {Object}
 * @param increase {Integer} -> Need to check this
 * Tests:
 * total = arena.total + increase
 */
function arenaIdealDistribution(arena, increase) {
    if (!increase) return {
        court_end:0,
        court_side:0,
        total:0,
        upper_level:0,
        vip:0
    };

    const ideal = currentIdeal(arena, increase);
    const diffToIdeal = differenceToIdeal(arena, ideal);
    const diffRatio = sectorDiffRatio(diffToIdeal);
    const idealIncrease = increaseByRatio(diffRatio, increase);

    console.log('ideal increaese', idealIncrease);
    return idealIncrease;
}

function currentIdeal(arena, increase) {
    const total = arena.total + increase;
    const dist = {
        court_side: parseInt(0.4 * total),
        court_end: parseInt(0.125 * total),
        upper_level: parseInt(0.45 * total),
        vip: parseInt(0.025 * total)
    };
    distributeRoundingError(dist, total);
    return dist;
}

function differenceToIdeal(arena, ideal) {
    const diff = {
        total: 0
    };
    for (let sector in ideal) {
        if (ideal.hasOwnProperty(sector)) {
            let d = ideal[sector] - arena[sector];
            diff[sector] = d < 0 ? 0: d;
        }
    }

    for (let sector in diff) {
        if (diff.hasOwnProperty(sector)) {
            diff.total += diff[sector];
        }
    }

    return diff;
}

function sectorDiffRatio(diffToIdeal) {
    const diffRatio = {};
    for (let sector in diffToIdeal) {
        if (diffToIdeal.hasOwnProperty(sector)) {
            let ratio = diffToIdeal[sector] / diffToIdeal.total;
            diffRatio[sector] = ratio;
        }
    }

    return diffRatio;
}

function increaseByRatio(diffRatio, increase) {
    const distIncrease = {};
    for (let sector in diffRatio) {
        if (diffRatio.hasOwnProperty(sector)) {
            let inc = diffRatio[sector] * increase;
            distIncrease[sector] = parseInt(inc);
        }
    }
    distributeRoundingError(distIncrease, increase);

    return distIncrease;
}

function distributeRoundingError(arenaDist, expectedTotal) {
    let total = 0;
    for (let sector in arenaDist) {
        if (arenaDist.hasOwnProperty(sector) && sector !== 'total') {
            total += arenaDist[sector];
        }
    }

    var diff = expectedTotal - total;

    for (let sector in arenaDist) {
        if (arenaDist.hasOwnProperty(sector) && diff > 0 && sector !== 'total') {
            arenaDist[sector] = arenaDist[sector] + 1;
            diff--;
        }
    }
}

export default arenaIdealDistribution;