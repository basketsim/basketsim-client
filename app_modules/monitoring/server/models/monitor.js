import Logs from './../../../../collections/Logs.js';
import {Meteor} from 'meteor/meteor';
import _ from 'underscore';

class Monitor {
    constructor(category) {
        this.ERROR = 'error';
        this.INFO = 'info';
        this.cid = Math.random().toString().substring(2);
        this.category = category;
    }
    log(type, tag, details, info) {
        var det = details;
        if (type === this.ERROR) {
            det = {
                error: details,
                message: details.message,
                stack: details.stack
            };
        }
        _insert(this.cid, type, this.category, tag, det, info);
    }
    runAndLog() {
        var args = Array.prototype.slice.call(arguments);
        var callback = args.pop();
        this.log(this.INFO, 'STARTED', callback.name);
        callback.apply(null, args);
        this.log(this.INFO, 'ENDED', callback.name);
    }
    runAndLogOnList(list, callback, logCountingName) {
        var counter = 0;
        var self = this;
        var length = 0;

        if (!list.length && list.length !== 0 && list.count) {
            length = list.count();
        } else if (list.length) {
            length = list.length;
        }

        this.log(this.INFO, 'STARTED', callback.name, {length:length, ran: counter});
        list.forEach(function(el, i) {
            try {
                callback.call(null, el);
                counter ++;
                console.log(logCountingName, i+1, '/', length);
            } catch(e) {
                self.log(self.ERROR, callback.name, e, el);
            }
        });
        this.log(this.INFO, 'ENDED', callback.name, {length:length, ran: counter});
    }
    /**
     * Wraps the original function in a try catch
     */
    tryToRunAndBubbleUp() {
        var args = Array.prototype.slice.call(arguments);
        var callback = args.pop();
        try {
            callback.apply(null, args);
        } catch(e) {
            this.log(this.ERROR, callback.name, e, args);
            throw e;
        }
    }
    tryToRun() {
        var args = Array.prototype.slice.call(arguments);
        var callback = args.pop();
        try {
            callback.apply(null, args);
        } catch(e) {
            this.log(this.ERROR, callback.name, e, args);
        }
    }
}

function _insert(cid, type, category, tag, details, info) {
    var logTypes = ['info', 'error'];
    var errInsert = {};

    if (!_.contains(logTypes, type)) {
        Meteor.error('type-mismatch', 'Type or category sent are not matching');
    }

    errInsert = {
        cid: cid,
        type: type,
        category: category,
        tag: tag,
        details: details,
        info: info,
        createdAt: new Date()
    };

    Logs.insert(errInsert);
}

export default Monitor;
