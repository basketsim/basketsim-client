function search(filter) {
    var q = _composeQuery(filter);
    // console.log('query would be', q);
    // console.log(Transfers.find(q).count());
    return Transfers.find(q, {sort:{'timestamps.expire':1}}).fetch();
}

function _composeQuery(f) {
    var skills = ['handling', 'quickness', 'passing', 'dribbling', 'rebounds', 'positioning', 'shooting', 'defense', 'experience', 'workrate'];
    var q = {
        'player.age': _filter(f.age, 14, 60),
        'player.height': _filter(f.height, 0, 300),
        'player.weight': _filter(f.weight, 0, 200),
        'player.wage': _filter(f.wage, 0, 400000),
        'price.end': _filter(f.price, 0, 90000000), //update price end on bid
        'player.freethrow': _skillFilter(f.freethrows, 0, 20),
        'player.character': _multiSelect(f.character, 'any character', true),
        'player.country': _multiSelect(f.country, 'any country', false),
        'position': _multiSelect(f.position, 'any position', false)
    }

    _.each(skills, function(skill){
        q['player.' + skill] = _skillFilter(f[skill], 0, 20);
    });

    q = _cleanQuery(q);
    return q;
}

function _cleanQuery(query) {
    for (var prop in query) {
        if (query[prop] === null) delete query[prop];
    }
    return query;
}

function _filter(filter, min, max) {
    if (!filter) return null;
    if (!_areIntegers(min, max)) return null;
    if (_defaultMinMax(min, max, filter)) return null;

    return {$gte: filter['min'], $lte: filter['max']};
}

function _skillFilter(filter, min, max) {
    if (!filter) return null;
    if (!_areIntegers(min, max)) return null;
    if (_defaultMinMax(min, max, filter)) return null;

    return {$gte: filter['min'] * 8, $lte: filter['max'] * 8};
}

function _multiSelect(filter, any, lowercase) {
    if (!filter) return null;
    if (filter[0].toLowerCase() === any) return null;
    if (!_areValidStrings.apply(this, filter)) return null;

    var arr = [];
    if (lowercase) {
        arr = _.map(filter, function(c){ return c.toLowerCase();});
    } else {
        arr = filter;
    }

    return {$in: arr};
}

function _defaultMinMax(min, max, filter) {
    if (filter['min'] === min && filter['max'] === max) return true;
    return false;
}

function _areValidStrings() {
    var allValid = true;
    _.each(arguments, function(s){
        if (!s) {
            allValid = false;
            return allValid;
        }
        if (typeof(s)!=='string') allValid = false;
        if (s.length > 30) allValid = false;
    });
    return allValid;
}

function _areIntegers() {
    var allInt = true;
    _.each(arguments, function(i){
        if (isNaN(parseInt(i))) allInt = false;
    });
    return allInt;
}

export default search;