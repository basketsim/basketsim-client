import { Template } from 'meteor/templating';
import userinfoModel from './../../user-management/client/models/userinfo-clientmodel.js';

Template.Achievements.onCreated(function(){
    var self = this;
    this.cardWidth = new ReactiveVar('');

    this.cdata = {
        userinfo: new ReactiveVar({})
    }

    this.autorun(function(){
        var param = Session.get('param-userinfoID');
        updateData(self, param);
    });
});

function updateData(tpl, userinfoID) {
    if (userinfoID) {
        userinfoModel.getByID(userinfoID, function (result) {
            tpl.cdata.userinfo.set(result);
        });

    } else {
        userinfoModel.getOwn(function (result) {
            tpl.cdata.userinfo.set(result);
        });
    }
}

Template.Achievements.helpers({
  achievements: function() {
    var tpl = Template.instance();
    var ach = tpl.cdata.userinfo.get().achievements;
    ach = _.sortBy(ach, function(a){return a.competition.season});
    ach = _compileAchievements(ach);
    tpl.cardWidth.set(95 * ach.length);
    return ach;
  },
  getCardWidth: function() {
    var tpl = Template.instance();
    var curWidth = tpl.cardWidth.get();
    return tpl.cardWidth.get();
  },
  hasAchievements: function() {
    var tpl = Template.instance();
    if (tpl.cdata.userinfo.get() && tpl.cdata.userinfo.get().achievements) return true;
    return false;
  }
});

function _compileAchievements(achievements) {
    return _.map(achievements, function (a) {
        switch(a.category) {
            case "trophy":
                _compileTrophyAchievement(a);
            break;
            case "achievement":
                _compileSimpleAchievement(a);
            break;
        }

        return a;
    });
}

function _compileTrophyAchievement(a) {
    switch (a.type) {
        case "League":
        a.compiled = {
            title: "Season " + a.competition.season,
            subtitle: 'League ' + a.competition.name
        }
        if (a.competition.level === 1) {
            a.compiled.imgPath = '/resources/achievements/league-champion.png';
            a.compiled.color = '#0D5B89';
        } else {
            a.compiled.imgPath = '/resources/achievements/low-league-champion.png';
            a.compiled.color = '#681a7e';
        }
        break;

        case "Cup":
        a.compiled = {
            title: "Season " + a.competition.season,
            subtitle: 'National Cup',
            imgPath: '/resources/achievements/cup-winner.png',
            color: '#005a8d'
        }
        break;

        case "Fair Play Cup":
        a.compiled = {
            title: "Season " + a.competition.season,
            subtitle: "Fair Play Cup",
            imgPath: '/resources/achievements/fair-play-cup.png',
            color: '#0da2a0'
        }
        break;

        case "Champions Series":
        a.compiled = {
            title: "Season " + a.competition.season,
            subtitle: "Champions Series",
            imgPath: '/resources/achievements/champions-series.png',
            color: '#3e8bd2'
        }
        break;

        case "Cup Winners Series":
        a.compiled = {
            title: "Season " + a.competition.season,
            subtitle: "Cup Winners Series",
            imgPath: '/resources/achievements/cup-winners-series.png',
            color: '#1d0442'
        }
        break;

        case "Youth Cup World Cup":
        a.compiled = {
            title: "Season " + a.competition.season,
            subtitle: "Youth Cup WC",
            imgPath: '/resources/achievements/ycwc.png',
            color: '#144f98'
        }
        break;
        case "Phoenix Trophy":
        a.compiled = {
            title: "Season " + a.competition.season,
            subtitle: "Phoenix Trophy",
            imgPath: '/resources/achievements/phoenix-trophy.png',
            color: '#1a237e'
        }
        break;
    }
}

function _compileSimpleAchievement(a) {
    switch (a.type) {
        case "10 Fair Play Cup Appearances":
        a.compiled = {
            title: "Season " + a.competition.season,
            subtitle: "10 FPC Seasons",
            imgPath: '/resources/achievements/10-fpc.png',
            color: '#7c9f27'
        }
        break;
        case "5 years in Basketsim":
        a.compiled = {
            title: "Season " + a.competition.season,
            subtitle: "5 years",
            imgPath: '/resources/achievements/5-years.png',
            color: '#27b8c1'
        }
        break;
    }
}