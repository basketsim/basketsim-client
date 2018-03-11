import math from './math.js'
import eh from './error-handling.js'
import general from './general.js'
import dates from './dates.js'
import countryCode from './countryCode';
import validations from './validations.js'

function butils() {
    return {math, eh, general, dates, countryCode, validations};
}

global.butils = butils();

export default butils();