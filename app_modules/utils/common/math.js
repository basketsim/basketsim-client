function math() {
    var api = {intRandRange, randRange, twoDecs, normalMinMax, log2, oneDec};

    function intRandRange(min, max) {
        butils.eh.vargs(intRandRange.name, min, max);
        return Math.round(Math.random() * (max - min) + min);
    }

    function randRange(min, max) {
        butils.eh.vargs(randRange.name, min, max);
        return Math.random() * (max - min) + min;
    }

    function twoDecs(num) {
        return Math.round(num*100)/100;
    }

    function oneDec(num) {
        return Math.round(num*10)/10;
    }

    function normalMinMax(min,max, avg, focusRatio) {
        butils.eh.vargs(normalMinMax.name, min, max);
        var mean, dev, normalVal;

        if (avg) {
            mean = avg;
        } else {
            mean = (min + max) / 2;
        }

        if (focusRatio) {
            dev = (max - mean) / focusRatio;
        } else {
            dev = (max - mean) / 3.2;
        }

        console.log(min, max, mean, dev);
        normalVal = chance.normal({mean:mean, dev:dev});

        if (normalVal > max) normalVal = max;
        if (normalVal < min) normalVal = min;
        return normalVal;
    }

    function log2(x) {
        return Math.log(x) / Math.LN2
    }

    return api;
}

export default math();