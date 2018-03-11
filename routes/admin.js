import { Router } from 'meteor/iron:router';
import {Meteor} from 'meteor/meteor';
import UserInfo from './../collections/UserInfo.js';
import Matches from './../collections/Matches.js';

Router.route('admin/tools', {
    waitOn: function() {
        return [Meteor.subscribe('userInfo'), Meteor.subscribe('test-match')];
    },
    action: function() {
        if (Meteor.userId() === 'wg2H3Bem7BrERkEsZ') {
            this.render('AdminTools');
        } else {
            document.location = '//www.basketsim.com';
        }
    },
    data: function (){
        return {
            userinfo: UserInfo.find().fetch()[0],
            match: Matches.find().fetch()[0]
        };
    }
});

Router.route('admin/monitoring', {
    action: function() {
        if (Meteor.userId() === 'wg2H3Bem7BrERkEsZ') {
            this.render('Monitor');
        } else {
            document.location = '//www.basketsim.com';
        }
    }
});

Router.route('admin/stats', {
    action: function() {
        if (Meteor.userId() === 'wg2H3Bem7BrERkEsZ') {
            this.render('AdminStats');
        } else {
            document.location = '//www.basketsim.com';
        }
    }
});
