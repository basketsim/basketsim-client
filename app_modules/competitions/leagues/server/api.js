/*Gathering api endpoints of the package for easy import/export */
import updates from './updates';
import playoff from './playoff';
import get from './get';

function leagues () {
    var api = {updates, playoff, get};
    return api;
}

export default leagues();