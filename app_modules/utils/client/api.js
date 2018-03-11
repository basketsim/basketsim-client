import validations from './validations.js';
import Events from 'stupidly-simple-events';
import general from './general.js';
import teamModel from './../../teams/client/models/team-clientmodel.js';
import playersModel from './../../players/client/models/players-clientmodel.js';

function cbutils() {
    var events = Events();
    var api = {validations, events, general, initComponent};
    return api;
}

function initComponent(component, el, props) {
    var interval = setInterval(function () {
        if (!$(el)[0]) return;
        component(el, props);
        clearInterval(interval);
    }, 100);
}

// function refreshEvents(events) {
//     events.on('player:refreshSession', function(){
//         console.log('player:refreshSession caught');
//         playersModel.refreshOwn(function(){});
//     });
//     events.on('team:refreshSession', function(){
//         console.log('team:refreshSession caught');
//         teamModel.refreshOwn(function(){});
//     });
// }

window.cbutils = cbutils();

export default cbutils();

