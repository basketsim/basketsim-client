import {store, m} from "../../app_modules/store/client/store";

Router.route('players', {
  action: function() {
    Session.set('param-playerID', null);
    this.render('Players');
    bsim.tools.setActiveMenus('Team', 'Players');
  }
});

Router.route('players/:player_id', {
  data: function (){
    return {
      type: 'players',
      headerImg: 'senior-team'
    };
  },
  action: function() {
    Session.set('param-playerID', this.params.player_id);
    this.render('PlayerInfo');
    bsim.tools.setActiveMenus('Team', 'Players');
  }
});

Router.route('youth', {
  action: function() {
    Session.set('param-playerID', null);
    this.render('Youth');
    bsim.tools.setActiveMenus('Team', 'Youth');
  }
});

Router.route('youth/:player_id', {
  data: function (){
    return {
      type: 'players',
      headerImg: 'youth-team'
    };
  },
  action: function() {
    Session.set('param-playerID', this.params.player_id);
    this.render('PlayerInfo');
    bsim.tools.setActiveMenus('Team', 'Youth');
  }
});

Router.route('training', {
  data: function() {
    if (this.params.query && this.params.query.r === '1') {
      return {
        refresh: true
      };
    }
  },
  action: function() {
    this.render('Training');
    bsim.tools.setActiveMenus('Team', 'Training');
  }
});

Router.route('coach-market', {
  waitOn: function() {
    return Meteor.subscribe('coach-market');
  },
  data: function (){
    return {
      coaches: Players.find({coach: 1, team_id: null})
    };
  },
  action: function() {
    this.render('CoachMarket');
    bsim.tools.setActiveMenus('Team', 'Training');
  }
});

Router.route('matches/:matchid', {
  action: function() {
    Session.set('param-matchDetails', this.params.matchid);
    this.render('MatchDetails');
    bsim.tools.setActiveMenus('Team', 'Matches');
  }
});

Router.route('match-viewer/:matchid/:side', {
  action: function() {
    const side = (this.params.side !== 'home' && this.params.side !== 'away') ? 'home': this.params.side;
    store.commit(m.matchLogs.SET_DISPLAYED_STATS , side);

    this.render('MatchViewerB', {
      data: function () {
        return {
          matchID: this.params.matchid,
          side: side,
        };
      }
    });
    bsim.tools.setActiveMenus('Team', 'Matches');
  }
})

Router.route('matches', {
  action: function() {
    Session.set('param-teamMatches', 'unfinished');
    this.render('TeamMatches');
    bsim.tools.setActiveMenus('Team', 'Matches');
  }
});

Router.route('match-history', {
  action: function() {
    Session.set('param-teamMatches', 'finished');
    this.render('TeamMatches');
    bsim.tools.setActiveMenus('Team', 'Matches');
  }
});