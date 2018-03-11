/**
 * News model. General api that is not strictly tied to business logic
 * @return {object} api object
 */
function model() {
    var api = {deleteTwoWeeksOld};

    function deleteTwoWeeksOld() {
        console.log('remove news starting');
        var timestampLimit = moment().subtract(2, 'weeks').valueOf();
        Events.remove({timestamp: {$lt: timestampLimit}});
        console.log('remove news ending');
    }

    return api;
}

export default model();