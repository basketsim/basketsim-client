global.DateUtils = {
    startDate: startDate,
    readableDate: readableDate
};

var calendar = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Take a start date as input and
 *
 * @param  {string} date Date string of format 'YYYY-MM-DD'
 * @return {string}      Date string of format 'YYYY-MM-DD', based on the available dates of the competition
 */
function startDate(date, startDayOfWeek) {
    var start;
    var dayOfWeek = 0;
    var dateMatched = false;
    var k=0;
    var momentStart;
    var startDateString = 'yyyy-mm-dd';
    if (date === undefined || date === null) {
        //if this is the case, stard date search from tomorrow.
        start = readableDate(moment());
        k=1;
    } else {
        //start date search from date
        start = date;
        k=0;
    }

    for (k; k<=7; k++) {
        if (moment(start).add(k, 'days').day() === startDayOfWeek) {
            momentStart = moment(start).add(k, 'days');
            startDateString = readableDate(momentStart);
            return startDateString;
        }
    }
}

function readableDate(momentDate) {
    var date = momentDate.year() + '-' + formatMonth(momentDate.month()) + '-' + doubleDigit(momentDate.date());
    return date;
}

function convertDayToNumber(playingDays) {
    var days = [];
    _.each(playingDays, function(dayString) {
        days.push(moment().day(dayString).day());
    });
    return days;
}

/**
 * Takes an iteger month as argument. First, increase by 1 to make it in the 1-12 range, instead of 0-11
 * @return {string} Nicely formatted month
 */
function formatMonth(month) {
    var newMonth = month + 1;
    newMonth = doubleDigit(newMonth);
    return newMonth;
}

/**
 * Takes an iteger as argument. If it is between 1-9, adds 0 in front and returns a string
 * @return {[type]} [description]
 */
function doubleDigit(value) {
    var num = parseInt(value);
    if (num < 10) {
        num = '0' + num;
    }
    return num;
}