class YouthTrainingDataModel {
    getByPlayerIDList(playerIDs) {
        return YouthTraining.find({player_id: {$in: playerIDs}}).fetch();
    }
    getByPlayerID(playerID) {
        return YouthTraining.findOne({player_id: playerID});
    }
}

export default new YouthTrainingDataModel();