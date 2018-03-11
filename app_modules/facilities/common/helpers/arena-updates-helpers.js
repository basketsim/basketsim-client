const arenaUpdatesHelpers = {
    cost, duration, totalSeats, reducedCapacity
};

/**
 * Tells the cost of an arena expense
 * @param costType {string} The type of cost, as string
 * @param newSeats {object} New seats, for each sector
 * @param arena {object} Current arena. Used to check if balcony was constructed
 * @returns {number} Cost of selected type
 */
function cost(costType, newSeats, arena) {
    const seatPrice = 125;
    const vipPrice = 675;
    const constructionPrice = 165000;

    const costs = {
        court_side: seatPrice * newSeats.court_side || 0,
        court_end: seatPrice * newSeats.court_end || 0,
        upper_level: seatPrice * newSeats.upper_level || 0,
        vip: vipPrice * newSeats.vip || 0,
        construction: constructionPrice,
        balcony: balconyCost(arena.upper_level, arena.vip, newSeats),
    };
    costs.total = costs.court_side + costs.court_end + costs.upper_level + costs.vip + costs.construction + costs.balcony;
    costs.total_fast = costs.total * 2;
    return costs[costType];
}

function duration(totalSeats) {
    if (!totalSeats) return 0;
    const days = Math.round(totalSeats/220) + 5;
    return days;
}

/**
 * If balcony was built, there is no additional cost
 * */
function balconyCost(arenaUpperLevel, arenaVip, newSeats) {
    const balconyInitial = 330000;
    const hasBalcony = parseInt(arenaUpperLevel, 10) || parseInt(arenaVip, 10);
    const buildingBalcony = parseInt(newSeats.upper_level) || parseInt(newSeats.vip);
    if (hasBalcony || !buildingBalcony) return 0;
    return balconyInitial;
}

function totalSeats(arena) {
    return arena.court_side + arena.court_end + arena.upper_level + arena.vip;
}

function reducedCapacity(arena, arenaUpdates) {
    if (!arenaUpdates) return arena;
    const reductionMultiple = 1.65;
    const maxReduction = 0.74;
    const capacity = {};
    const capacityReduction = {
        court_side: (arenaUpdates.court_side / arena.court_side) * reductionMultiple,
        court_end: (arenaUpdates.court_end / arena.court_end) * reductionMultiple,
        upper_level: (arenaUpdates.upper_level / arena.upper_level) * reductionMultiple,
        vip: (arenaUpdates.vip / arena.vip) * reductionMultiple
    };

    for (let sector in capacityReduction) {
        if (capacityReduction.hasOwnProperty(sector)) {
            if (capacityReduction[sector] > maxReduction) capacityReduction[sector] = maxReduction;
            capacity[sector] = arena[sector] - Math.round(capacityReduction[sector] * arena[sector]);
        }
    }

    capacity.total = totalSeats(capacity);

    return capacity;
}

export default arenaUpdatesHelpers;