Router.route('national/leagues/:country?/:level?/:series?/:season?', {
    action: function() {
        Session.set('param-league-path', this.url);
        this.render('National');
        bsim.tools.setActiveMenus('Competitions', 'National');
    },
    data: function() {
        return {
            country: this.params.country,
            level: this.params.level,
            series: this.params.series,
            season: this.params.season
        }
    }
});

Router.route('national/cup', {
    action: function() {
        var team = Session.get('team');
        var country = team.country.toLowerCase().replace(/ /g, '-');
        var gi = Session.get('gameInfo');
        var season = null;
        if (gi) season = gi.season;

        season = 27; //temporary hack

        bsim.tools.setActiveMenus('Competitions', 'National');
        Router.go('/national/cup/'+country+'/1/'+ season, {replaceState:true});
    }
});
Router.route('national/cup/:country/:round/:season', {
    action: function() {
        bsim.tools.setActiveMenus('Competitions', 'National');
        this.render('Cup');
    },
    data: function() {
        var country = removeSlash(this.params.country);
        country = toTitleCase(country);
        if (country === 'Usa') country = 'USA';
        if (country === 'Fyr Macedonia') country = 'FYR Macedonia';
        return {
            country: this.params.country,
            round: this.params.round,
            season: this.params.season
        };
    }
});

Router.route('international', {
    waitOn: function() {
        return [Meteor.subscribe('international-phoenix'), Meteor.subscribe('phoenix-playoff', 50)];
    },
    action: function() {
        this.render('International');

        bsim.tools.setActiveMenus('Competitions', 'International');
    }
});

Router.route('world-cup', {
    action: function() {
        this.render('WorldCup');

        bsim.tools.setActiveMenus('Competitions', 'World Cup');
    }
});

Router.route('live', {
    //subscribe to matches that are in live and to teams playing to get info
    waitOn: function() {
        return Meteor.subscribe('live');
    },
    action: function() {
        var userinfo = UserInfo.getCurrent();
        var self = this;
        Meteor.subscribe('live', function(){
            self.render('Live');
        });
        Meteor.subscribe('live-matches');


        bsim.tools.setActiveMenus('Competitions', 'Live');
    },
    data: function() {
        return {
            matches: Matches.find().fetch()
        };
    }
});

function removeSlash(str) {
    return str.split('-').join(' ');
}

function toTitleCase(str)
{
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}