import coach from './coach-market.js';
import marketActivity from './transfer-market/market-activity.js';
import transfer from './transfer-market/transfer.js';

function markets() {
    var api = {coach, marketActivity, transfer};

    return api;
}

export default markets();