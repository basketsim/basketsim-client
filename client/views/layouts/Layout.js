import Sidebar from './../../../app_modules/app/client/layouts/Sidebar';
import utils from './../../../app_modules/utils/client/api';

var intervalId;
Template.Layout.onRendered(function () {
    var height = $('header').height();
    var newHeight = height;
    $('#content').css('margin-top', height);
    utils.initComponent(Sidebar, '#sidebar');

    intervalId = setInterval(function(){
        newHeight = $('header').height();
        if (newHeight !== height) {
            height = newHeight;
            $('#content').css('margin-top', height);
        }
    }, 500);
});

Template.Layout.onDestroyed(function(){
    if (intervalId) clearInterval(intervalId);
});

Template.Layout.helpers({
    season: function () {
        if (Session.get('gameInfo')) {
            return Session.get('gameInfo').season;
        } else {
            return '';
        }
    },
    week: function() {
        if (Session.get('gameInfo')) {
            return Session.get('gameInfo').week;
        } else {
            return '';
        }
    }
});

