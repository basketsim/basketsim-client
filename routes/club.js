Router.route('club/:id?', {
    action: function() {
        Session.set('param-userinfoID', this.params.id);
        this.render('Home');
        bsim.tools.setActiveMenus('Club', 'Home');
    }
});

Router.route('create-club', {
    action: function() {
        var self = this;
        Meteor.call('user-management:userinfo:userHasUserInfo', function (error, result) {
            if (result) {
                self.redirect('/club');
            } else if (!result){
                self.render('CreateClub');
                bsim.tools.setActiveMenus('Club', 'Home');
            } else if (error) {
                sAlert.error(error.reson);
            }
        });
    }
});

Router.route('teams/:id', {
    action: function(){
        var self = this;
        Meteor.call('getClubByTeam', self.params.id, function(err, clubid){
            if (clubid!=='bot') {
                Router.go('/club/'+clubid,{}, {replaceState:true});
            } else {
                history.back();
                setTimeout(function(){
                    sAlert.info('Team inactive');
                }, 200)
            }
        });
    }
});

Router.route('finances', {
    action: function() {
        this.render('Finances');

        bsim.tools.setActiveMenus('Club', 'Finances');
    }
});

Router.route('market', {
    action: function() {
        this.render('Market');
        bsim.tools.setActiveMenus('Club', 'Market');
    }
});

Router.route('market/players', {
    action: function() {
        //check if search filter is defined
        if (Session.get('searchFilter')) {
            this.render('TransferList');
            bsim.tools.setActiveMenus('Club', 'Market');
        } else {
            Router.go('/market');
        }
    }
});

Router.route('facilities', {
    action: function() {
        this.render('Facilities');

        bsim.tools.setActiveMenus('Club', 'Facilities');
    }
});

Router.route('tools', {
    action: function() {
        this.render('Tools');

        bsim.tools.setActiveMenus('Club', 'Tools');
    }
});