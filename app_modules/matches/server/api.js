import creation from './creation.js';
import updates from './updates.js';


function matches() {
    var setMatch = creation.setMatch;
    var createMatch = creation.createMatch;

    var api = {setMatch, createMatch, updates};
    return api;
}

export default matches();