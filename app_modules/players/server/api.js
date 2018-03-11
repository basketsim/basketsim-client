import senior from './senior';
import youth from './youth';
import coach from './coach';
import grow from './grow.js';
import experience from './experience.js'
import ev from './ev.js';


function players() {
    var api = {senior, youth, coach, grow, experience, ev};
    return api;
}

export default players();