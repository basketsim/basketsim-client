/**
 * Schema
 * country: String (ex:Romania)
 * utcOffset: String/Nmber (ex:+2)
 * nat_league: [{day:1, time: '15:30'}, {day:5, time:20:00}]
 * cup: [{{day:1, time: '15:30'}}]
 */
global.Dates = new Mongo.Collection('dates');