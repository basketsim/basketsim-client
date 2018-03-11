import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { sAlert } from 'meteor/juliancwirko:s-alert';
import _ from 'underscore';
import moment from 'moment';


Template.Monitor.onCreated(function() {
    var self = this;
    this.cdata = {
        logs: new ReactiveVar([]),
        cidStatus: new ReactiveVar(null)
    };

    Meteor.call('monitoring:getLogs', function(error, logs){
        if (error) {
            sAlert.error('Failed to retrive logs');
        } else {
            self.cdata.logs.set(logs);
            setCidStatus(self, logs);
        }
    });
});

Template.Monitor.helpers({
    logs: logsHelper,
    momentCalendar: momentCalendar,
    statusBadge: statusBadge,
    statusBadgeColor: statusBadgeColor
});

function setCidStatus(tpl, logs) {
    var cidStatus = {};
    logs.forEach(function (log) {
        if (log.type === 'info') {
            if (!cidStatus[log.cid]) cidStatus[log.cid] = [];
            cidStatus[log.cid].push(log);
        }
    });

    tpl.cdata.cidStatus.set(cidStatus);
    console.log('cidStatus', cidStatus);
}

function getCidStatus() {
    var tpl = Template.instance();
    return tpl.cdata.cidStatus.get();
}

function statusBadge() {
    if (this.tag !== 'ENDED') return '';
    var badge = '';
    var val = '';

    /*Set the text*/
    if (this.info) {
        val = `${this.info.ran}/${this.info.length}`;
    } else {
        val = '';
    }

    /*Set the color*/
    if (!this.info || this.info.ran !== this.info.length) {
        badge = `<span style="background-color:red" class="badge">${val}</span>`;
    } else {
        badge = `<span style="background-color:green" class="badge">${val}</span>`;
    }

    return badge;
}

function statusBadgeColor() {
    var cidStatus = getCidStatus();
    if (cidStatus[this.cid].length !== 2) return 'red';
    return 'green';
}

function logsHelper(category) {
    var logs = getLogs();
    var tlogs = _.filter(logs, function(log){
        return (log.type === 'info' && log.category === category);
    });

    console.log('tlogs', tlogs);

    return tlogs;
}

function getLogs() {
    var tpl = Template.instance();
    var logs = tpl.cdata.logs.get();
    if (!logs) return [];
    return logs;
}

function momentCalendar(dateObj) {
    return moment(dateObj).calendar();
}
