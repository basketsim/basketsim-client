class GameInfoModel {
    get(callback) {
        let gi = Session.get('gameInfo');
        if (gi) {
            callback(gi);
        } else {
            Meteor.call('game-info:get', function (error, gameInfo) {
                if (error) {
                    sAlert.error('Cannot retrieve current season number');
                } else {
                    callback(gameInfo);
                    Session.set('gameInfo', gameInfo);
                }
            });
        }
    }
}

export default new GameInfoModel();