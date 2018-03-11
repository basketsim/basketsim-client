export default {
    create
};

function create(playerID, playerName, teamID, category) {
    return {
        playerID: playerID,
        teamID: teamID,
        category: category,
        playerName: playerName,
        createdAt: new Date()
    };
}

