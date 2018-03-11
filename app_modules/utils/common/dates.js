function dates() {
    var api = {available};

    /**
     * [available description] Returns all possible playing dates between first and last date
     * @param  {string} firstDate    First available date for a match
     * @param  {string} lastDate     Last available date for a match
     * @param  {array int} playingDates 0 - Sunday, 1 - Monday ... 6- Saturday.
     * @return {array strings} All the available dates that matches can be scheduled on between first and last date
     */
    function available(start, end, playingDates) {
        var firstSunday = _getSunday(start);
        var lastSunday = _getSunday(end);
        var currSunday = firstSunday;

        var dates = [];

        while(lastSunday.valueOf() >= currSunday.valueOf()) {
            _.each(playingDates, function(day) {
                var playDay = moment(currSunday).add(day, 'days');
                if (playDay.valueOf() <= moment(end).valueOf() && playDay.valueOf() >= moment(start).valueOf()) {
                    dates.push(playDay.format("YYYY-MM-DD"));
                }
            });
            //remove this after scheduling
            // playingDates = _.without([1,2,4,5], 2);
            currSunday.add(1, 'week');
        }

        return dates;

    }

    /**
     * [dateStringFromTimestamp description]
     * @param  {[type]} timestamp Time to be converted to date string
     * @return {string}           Date String. Format yyyy-mm-dd
     */
    function dateStringFromTimestamp(timestamp) {
        return moment(timestamp).format('YYYY-MM-DD');
    }

    function _getSunday(date) {
        var day = moment(date, "YYYY-MM-DD").day();
        return moment(date).subtract(day, 'days');
    }

    return api;
}

export default dates();