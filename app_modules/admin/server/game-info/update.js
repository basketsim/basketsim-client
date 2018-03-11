function update() {
    var api = {addCollection, weekProgress};

    function addCollection() {
        GameInfo.insert({
            season: 23,
            week: 11,
            activeUsers: {
                weekly: [],
                monthly: [],
                all: [] //all is 14 weeks. If a user never logs for 1 whole season, it gets inactive
            }
        });
    }

    /**
     *  Every sunday midnight/morning, increase week number.
     *  If week > 14, reset week to 1 and increase season
     */
    function weekProgress() {
        var gi = GameInfo.findOne();
        var setter = {
            week: gi.week,
            season: gi.season
        };
        if (gi.week === 14) {
            setter.week = 1;
            setter.season ++;
        } else {
            setter.week++;
        }

        GameInfo.update({_id: gi._id}, {$set: setter});
    }

    function users() {
        //have this for weekly, monthly, all
        var activity = {
            timestamp: 0,
            value: 0
        }
    }

    return api;
}

export default update();