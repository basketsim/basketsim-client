import _ from 'underscore';

function pushOrReplace(originalArray, newArray, key) {
    const newKeys = newArray.map((item) => {
        return deep_value(item, key);
    });
    const keep = _.filter(originalArray, function (item) {
        return (!_.contains(newKeys, deep_value(item, key)));
    });
    keep.push(...newArray);

    return keep;
}

var deep_value = function(obj, key){
    for (var i=0, path=key.split('.'), len=path.length; i<len; i++){
        obj = obj[path[i]];
    }
    return obj;
};

export default pushOrReplace;