import game from './game';
import utils from './utils';
import admin from './admin';
import model from './model.js';

function news() {
    var api = {game, utils, admin, model}
    return api;
}

export default news();