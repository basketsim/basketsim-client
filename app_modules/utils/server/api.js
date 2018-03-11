import validations from './validations.js';
import general from './general.js';

function utils() {
    var api = {validations, general};

    return api;
}
global.sbutils = utils();

export default utils();