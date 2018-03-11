Template.PlayerOptions.helpers({
    lastRow: function (argument) {
        // WILL BE DEVELOPED AFTER METEOR 1.2 UPDATE
    },
    dotify: dotify,
    round: round

});

function dotify(x) {
    if (!x) return;
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return parts.join(".");
}

function round(x) {
    return Math.round(x);
}