import senior from './senior.js';
import seniorCron from './senior-cron.js';
import youth from './youth.js';
import coach from './coach.js';

function training() {
    var api = {senior, youth, seniorCron, coach};
    return api;
}

export default training();