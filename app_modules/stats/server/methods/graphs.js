function plotted(intervals, dataSize, min,max, avg, devRatio) {
    var data = getData(dataSize, min,max, avg, devRatio);
    var range = (max-min)/intervals;
    var sum = 0;
    var weights = [];

    for (var i=min; i<max; i=i+range) {
        _.each(data, function(d){
            if (d>i && d<=i+range) {
                sum++;
            }
        });
        weights.push([i, sum]);
        sum = 0;
    }
    return weights;

}
function getData(dataSize, min,max, avg, devRatio) {
    var data = [];
    var plotted = [];
    for (var i=0; i<dataSize; i++) {
        data.push(normalMinMax(min,max, avg, devRatio))
    }
    data.sort(function(a, b){return a-b});
    return data;
}
/**
 * http://jsfiddle.net/bsz1crr9/
*/
function normalMinMax(min,max, avg, devRatio) {
    var mean, dev, normalVal;

    if (avg) {
        mean = avg;
    } else {
        mean = (min + max) / 2;
    }

    if (devRatio) {
        dev = devRatio * mean;
    } else {
        dev = (max - mean) / 3.2;
    }

    console.log(min, max, mean, dev);
    normalVal = chance.normal({mean:mean, dev:dev});

    if (normalVal > max) normalVal = max;
    if (normalVal < min) normalVal = min;
    return normalVal;
}