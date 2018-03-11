/*
    match_id: match that is being played live
    info: total time and attack time
    events: {
        evt1: {}
    }
 */
if (Meteor.isClient) {
    global.LiveMatches = new Mongo.Collection('live-matches');
}