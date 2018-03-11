Accounts.onLogin(function(info){
    Meteor.call('user-management:userinfo:userHasUserInfo', function (error, result) {
        if (error) {
            sAlert.error(error.reason);
        } else if (!result) {
            Router.go('/create-club');
        } else {
            Meteor.call('user-management:userinfo:logged-in');
        }
    });
});