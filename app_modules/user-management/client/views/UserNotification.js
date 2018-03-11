import userinfoModel from './../models/userinfo-clientmodel.js';

import moment from 'moment';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

Template.UserNotification.onCreated(function(){
    var self = this;
    this.cdata = {
        userinfo: new ReactiveVar(null)
    };

    userinfoModel.getOwn(function(userinfo){
        self.cdata.userinfo.set(userinfo);
    });
});

Template.UserNotification.helpers({
    display: display
});

function display() {
    var disp = 'none';
    var userinfo = getUserInfo();
    var dateLimit = moment().subtract(5, 'weeks').valueOf();
    var lastLogin = 0;

    if (userinfo) {
        lastLogin = userinfo.lastlog.valueOf();
        if (userinfo.willRemove && (lastLogin < dateLimit || typeof userinfo.lastlog === 'string' || typeof userinfo.lastlog === 'number')) disp = 'block';
    }

    return disp;
}

function getUserInfo() {
    var tpl = Template.instance();
    return tpl.cdata.userinfo.get();
}