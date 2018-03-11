import model from './models/model.js';
import seasonUpdates from './season-updates.js';

function leaguesApi() {
    var api = {model, seasonUpdates};

    return api;
}

export default leaguesApi();