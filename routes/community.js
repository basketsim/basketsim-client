// Router.route('messages', {
//     action: function() {
//         this.render('Messages');
//         bsim.tools.setActiveMenus('Community', 'Messages');
//     }
// });

Router.route('help-and-rules', {
    action: function() {
        this.render('Help');
        bsim.tools.setActiveMenus('Community', 'Help & Rules');
    }
});

Router.route('edit-profile', {
    action: function() {
        this.render('Profile');
        bsim.tools.setActiveMenus('Community', 'Edit Profile');
    }
});

Router.route('transfers-history', {
    action: function() {
        console.log('player, team, date', this.params.query.player, this.params.query.team, this.params.query.date);
        Session.set('tranfer-archive:team_id', this.params.query.team);
        Session.set('tranfer-archive:player_id', this.params.query.player);
        Session.set('transfer-archive:date', this.params.query.date);
        Session.set('transfer-archive:minPrice', this.params.query.minPrice);
        Session.set('transfer-archive:maxPrice', this.params.query.maxPrice);
        this.render('TransfersHistory');
        bsim.tools.setActiveMenus('Community', 'Transfers History');
    },
    //This is kinda useless since there is no reactivity in the routes
    data: function () {
        return {
            player_id: this.params.query.player,
            team_id: this.params.query.team,
            date: this.params.query.date,
            minPrice: this.params.query.minPrice,
            maxPrice: this.params.query.maxPrice
        };
    }
});

Router.route('transfers-history/flags', {
    action: function () {
        bsim.tools.setActiveMenus('Community', 'Transfers History');
        this.render('TransferFlags');
    }
});

Router.route('transfers-history/:transfer_id', {
    action: function () {
        this.render('TransferDetails');
        bsim.tools.setActiveMenus('Community', 'Transfers History');
    },
    data: function () {
        return {
            transferID: this.params.transfer_id
        };
    }
});

Router.route('help-and-rules/introduction', {
    action: function() {
        this.render('Introduction');
    }
});
Router.route('help-and-rules/players', {
    action: function() {
        this.render('HelpPlayers');
    }
});
Router.route('help-and-rules/training', {
    action: function() {
        this.render('HelpTraining');
    }
});
Router.route('help-and-rules/youth', {
    action: function() {
        this.render('HelpYouth');
    }
});
Router.route('help-and-rules/transfers', {
    action: function() {
        this.render('HelpTransfers');
    }
});
Router.route('help-and-rules/finances', {
    action: function() {
        this.render('HelpFinances');
    }
});
Router.route('help-and-rules/arena', {
    action: function() {
        this.render('HelpArena');
    }
});
Router.route('help-and-rules/matches', {
    action: function() {
        this.render('HelpMatches');
    }
});
Router.route('help-and-rules/match-sim', {
    action: function() {
        this.render('HelpMatchSim');
    }
});
Router.route('help-and-rules/match-engine', {
    action: function() {
        this.render('HelpMatchEngine');
    }
});
Router.route('help-and-rules/player-character', {
    action: function() {
        this.render('HelpPlayerCharacter');
    }
});
Router.route('help-and-rules/tactics', {
    action: function() {
        this.render('HelpTactics');
    }
});
Router.route('help-and-rules/national-teams', {
    action: function() {
        this.render('HelpNational');
    }
});
Router.route('help-and-rules/international-competitions', {
    action: function() {
        this.render('HelpInternationalCompetitions');
    }
});
Router.route('help-and-rules/denominations', {
    action: function() {
        this.render('Denominations');
    }
});