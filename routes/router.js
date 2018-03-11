var noRedirect = ['/forum-login', '/verify-email', '/reset-password'];

Router.configure({
	layoutTemplate: 'Layout',
	loadingTemplate: 'Loading',
	notFoundTemplate: 'Redirect404'
});

Router.onBeforeAction(function () {
	Session.set('url_path', this.route._path);
	if (_.contains(noRedirect, this.url) || this.url.search('reset-password') !== -1) {
		this.next();
	} else {
		if (!Meteor.userId()) {
			this.redirect('/');
			this.render('Landing');
		} else {
	        var userinfo;
	        var team;

	        Meteor.subscribe('userData', function(){
	            userinfo = UserInfo.findOne({_id: Meteor.user().userInfo_id});
	            Session.set('userinfo', userinfo);
	        });

			this.next();
		}
	}

});

Router.route('/', {
	data: function() {
		return Meteor.user();
	},
	action: function() {
		//check if you do club or news redirection
		this.redirect('club/:id?');
	}
});

Router.route('forum-login', {
	action: function() {
		console.log('ROUTING TO FORUM LOGIN');
		var self = this;

		Accounts.onLogin(function(){
			if (Session.get('url_path') === '/forum-login') {
				Meteor.call('forumAuth', self.params.query.sig, self.params.query.sso, function (error, loginString) {
					window.location = '//forum.basketsim.com/session/sso_login?'+loginString;
				});
			}
		});

		Meteor.call('forumAuth', this.params.query.sig, this.params.query.sso, function (error, loginString) {
			if (loginString === 'USER_NOT_LOGGED') {
				setTimeout(function (argument) {
					self.render('ForumLogin');
				}, 300);

			} else {
				window.location = '//forum.basketsim.com/session/sso_login?'+loginString;
			}
		});
	}
});