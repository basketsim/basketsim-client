import {Modal} from 'meteor/peppelg:bootstrap-3-modal';
import SearchBar from './../../../app_modules/vue_rest/search/client/SearchBar';
import { initComponent } from "../../../app_modules/vue_rest/utils/client/helpers";

var active;
var activeSub;
var template;

Template.Header.events({
    'click .menuRow.first a': function (event) {
        changeActive(event.target);
    },
    'click .menuRow.second a': function (event) {
        changeActiveSub(event.target);
    },
    'click .logout': function() {
        Meteor.logout(function(){
            $('.search-bar').remove();
            location = '/';
        });
    },
    'click .login': function(event) {
        event.preventDefault();
        Modal.show('Modal', {
            modalName: 'Welcome!',
            modalContentName: 'LoginModal',
            modalClass: 'login-form',
            maxWidth: '400px'
        });
    },
    'click .title-logo': clickLogo,
    'click #open-tools': openTools
});

Template.Header.onCreated(function(){
    template = this;
});

Template.Header.onRendered(function() {
  initComponent(SearchBar, '#search-bar');
});

Template.Header.helpers({
    checkActive: function(name) {
        if (Session.get('tab') === name) {
            active = name;
            return 'custom-active';
        }
        if (Session.get('submenu') === name) {
            activeSub = name;
            return 'custom-active';
        }
    },
    submenu: submenu,
    slug: function(txt) {
        var slug = '';
        slug = txt.toLowerCase();
        slug = slug.replace(/ /g, '-');
        slug = slug.replace(/&/g, 'and');

        if (slug==='home') slug = 'club';
        return slug;
    },
    target: function (txt) {
        var slug = '';
        slug = txt.toLowerCase();
        slug = slug.replace(/ /g, '-');
        slug = slug.replace(/&/g, 'and');

        if (slug==='forum' || slug==='news') {
            return '_blank';
        } else {
            return '';
        }
    }
});

function clickLogo(event) {
    event.preventDefault();
    if (location.pathname === '/create-club') {
        Router.go('/create-club');
    } else {
        Router.go('/club');
    }
}

function changeActive(newActive) {
    var el = template.find('.custom-active');
    $(el).removeClass('custom-active');
    $(newActive).addClass('custom-active');

    Session.set('tab', $(newActive).text());
}

function changeActiveSub(newActive) {
    var el = template.find('.menuRow.second .custom-active');
    $(el).removeClass('custom-active');
    $(newActive).addClass('custom-active');

    Session.set('submenu', $(newActive).text());
}

function openTools() {
    Modal.show('EmptyModal', {
        modalName: 'Tools',
        modalContentName: 'ToolsModal',
    });
}

function submenu() {
    var submenu = [];
    var xsSize = 2;
    var menu = Session.get('tab');
    switch(menu) {
        case 'Club':
        submenu = ['Home', 'Finances', 'Market', 'Facilities'];
        xsSize = 3;
        break;
        case 'Team':
        submenu = ['Players', 'Training', 'Youth', 'Matches'];
        xsSize = 3;
        break;
        case 'Competitions':
        submenu = ['National', /*'International', 'World Cup'*/ 'Live'];
        xsSize = 3;
        break;
        case 'Community':
        submenu = ['Help & Rules', 'Edit Profile', 'Transfers History']; /*'Tools', 'Profile' remove news*/
        xsSize = 3;
        break;
    }
    return {submenu: submenu, size: xsSize};
}