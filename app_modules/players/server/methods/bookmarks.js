import {Meteor} from 'meteor/meteor';
import {Mongo} from 'meteor/mongo';
import bookmarkModel from './../models/bookmarks-model';
import Players from './../../../../collections/Players';
import teamModel from './../../../teams/server/models/team-datamodel';
import {Bookmarks} from './../../../../collections/collections';
import mongojs from 'mongojs';

Meteor.methods({
    'players:bookmarks:create': create,
    'players:bookmarks:read': read,
    'players:bookmarks:delete': remove
});

function create(playerIDStr, category) {
    const BOOKMARK_LIMIT = 100;
    if (!category || category.length > 24) {
        throw new Meteor.Error('invalid-category', 'Please specify a bookmark category that is shorter than 24 characters');
    }
    if (!playerIDStr) throw new Meteor.Error('invalid-playerID', 'No playerID specified');

    const playerID = new Mongo.ObjectID(playerIDStr);
    const player = Players.findOne({_id: playerID}, {fields: {name:1, surname:1, transfer_id:1}});
    if (!player) throw new Meteor.Error('no-player', 'No player found for this id');

    const playerName = player.name + ' ' + player.surname;
    const team = teamModel.getOwn(this.userId, {_id:1});
    if (!team) throw new Meteor.Error('np-team', 'No team found');

    const bookmarksCount = Bookmarks.find({teamID: team._id}).count();
    if (bookmarksCount >= BOOKMARK_LIMIT) throw new Meteor.Error('too-many-bookmarks', `Cannot save more than ${BOOKMARK_LIMIT} bookmarks`);

    const bookmark = bookmarkModel.create(playerID, playerName, team._id, category);
    const _id = Bookmarks.insert(bookmark);

    bookmark._id = _id;
    bookmark.playerOnSale = player.transfer_id ? true : false;

    return bookmark;
}

function read() {
    const team = teamModel.getOwn(this.userId, {_id:1});
    if (!team) throw new Meteor.Error('np-team', 'No team found');

    const bookmarks = Bookmarks.find({teamID: team._id}).fetch();
    const playersIDList = bookmarks.map((item) => {return item.playerID; });

    Players.find({_id: {$in: playersIDList}}, {fields: {transfer_id: 1}}).forEach((player) => {
       bookmarks.forEach((bookmark) => {
          if (bookmark.playerID._str === player._id._str) {
              bookmark.playerOnSale = player.transfer_id ? true : false;
          }
       });
    });

    return bookmarks;
}

function remove(_id) {
    const bookmark = Bookmarks.findOne({_id: _id}, {fields: {teamID: 1}});
    const team = teamModel.getOwn(this.userId, {_id:1});
    if (!team) throw new Meteor.Error('np-team', 'No team found');
    if (!bookmark) throw new Meteor.Error('no-bookmark', 'No bookmark found');

    if (team._id._str !== bookmark.teamID._str) throw new Meteor.Error('np-team', 'No rights to remove this bookmark');

    Bookmarks.remove({_id: _id});
}