import VeeValidate from 'vee-validate';
import Vue from 'vue/dist/vue.common';

Meteor.startup(function () {
    loginToForum();
    configAlert();
    setGameInfo();
    Vue.use(VeeValidate);
});

function refresh(waitTime) {
    setTimeout(function(){
        $('header').append('<iframe class="forum-iframe" src="http://forum.basketsim.com/session/sso" width="1" height="1" tabindex="-1" title="Discourse SSO" style="display:none" hidden>');
    }, waitTime);
    setTimeout(function(){
        $('header .forum-iframe').remove();
    }, waitTime+10000);
}

function loginForumHack() {
    var i = setInterval(function(){
        $('header').append('<iframe class="forum-iframe" src="http://forum.basketsim.com/session/sso" width="1" height="1" tabindex="-1" title="Discourse SSO" style="display:none" hidden>');
        setTimeout(function(){
            $('header .forum-iframe').remove();
        }, 4500);
    }, 5000);
    setTimeout(function(){
        clearInterval(i);
    }, 16000);
}

function loginToForum() {
    if (Meteor.userId()) {
        refresh(3000);
    }

    Accounts.onLogin(function(){
        loginForumHack();
        Modal.hide('LoginModal');
    });
}

function configAlert() {
    sAlert.config({
        effect: 'stackslide',
        position: 'bottom',
        timeout: 6000,
        html: false,
        onRouteClose: true,
        stack: true,
        offset: 0
    });
}

function setGameInfo() {
    Meteor.call('game-info:get', function(err, res){
        Session.set('gameInfo', res);
    });
}

