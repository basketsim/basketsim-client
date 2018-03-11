import {Meteor} from 'meteor/meteor';

/**
 * This should replace the api at some point
 * */
const utils = {
    error
}

function error(errorType, error) {
    throw new Meteor.Error(errorType, error.message.substring(0, error.message.indexOf(':')));
}

export default utils;