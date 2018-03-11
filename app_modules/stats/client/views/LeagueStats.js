import cstats from './../data/stats.js'
import { Template } from 'meteor/templating';

var m = models();

Template.LeagueStats.onCreated(function () {
    this.cdata = {
        tops: new ReactiveVar(null)
    };
    compileStats(this);
    m.statType.init('totals');
    m.stat.init('FG');
    m.statSection.init('Stats Summary');
    m.title.init(m.statSection.get() + ' - ' + m.statType.get('name'));
});

Template.LeagueStats.events({
    'click .show-league': function (e) {
        e.preventDefault();
        $('.league-standings').show();
        $('.stats').hide();
    },
    'click .stats-per-match, click .stats-totals': function(e) {
        e.preventDefault();
        $('.totals-summary').toggle();
        $('.perMatch-summary').toggle();
    },
    'click .stats-per-match': function(e) {
        e.preventDefault();
        m.statType.set('perMatch');
        m.title.set(m.statSection.get() + ' - ' + m.statType.get('name'));
    },
    'click .stats-totals': function(e) {
        e.preventDefault();
        m.statType.set('totals');
        m.title.set(m.statSection.get() + ' - ' + m.statType.get('name'));
    },
    'click .show-summary':function(e) {
        e.preventDefault();
        var tpl = Template.instance();
        tpl.$('.show-summary').hide();

        m.statSection.set('Stats Summary');
        m.title.set(m.statSection.get() + ' - ' + m.statType.get('name'));

        toggleStatDetail();
    }
});

Template.LeagueStats.events(statEvents());

function statEvents() {
    var stats = ["MC","FG","FGA","FGX","3P","3PA","3PX","2P","2PA","2PX","FT",
    "FTA","FTX","ORB","DRB","TRB","AST","STL","BLK","TO","FO","PTS", "EFF"];
    var events = {};
    _.each(stats, function(stat){
        events['click .'+stat] = function(e){
            e.preventDefault();
            statDetail(classToKey(stat));
        }
    });

    return events;
}

Template.LeagueStats.helpers({
    statUrls: statUrls,
    overview: overview,
    top: top,
    topOwn: topOwn,
    title: m.title.get,
    reactiveStat: m.stat.getReactive,
    statType: m.statType.getReactive
});

/**
 * Produce compiled stats from the players passed
 * @param  {[type]} ctx [description]
 */
function compileStats(ctx) {
    var cs = ctx.data.season;
    var players = [];

    var self = ctx;
    Meteor.call('stats:getLeaguePlayers', ctx.data.stats[cs].players, cs, ctx.data.leagueID, function (error, result) {
        players = result;

        _.each(players, function(player){
            if (player.stats && player.stats[cs]) {
                let comp = cstats(player.stats);
                player.stats.compiled = {
                    per36: comp.per36[cs].range['S'+cs+' ALL'].stats,
                    perMatch: comp.perMatch[cs].range['S'+cs+' ALL'].stats,
                    totals: comp.totals[cs].range['S'+cs+' ALL'].stats
                }
            }
        });
        self.data.compiledStats = players;

        compileTops(self);
    });
}

/**
 * [compileTops description]
 * @param  {[type]} self [description]
 * @return {[type]}      [description]
 */
function compileTops(self) {
    var tops = initTops();
    var playersArray = self.data.compiledStats;

    _.each(tops.totals, function(top, key){
        tops.totals[key] = _.sortBy(playersArray, function(player){ return getStat(player, key, 'totals') }).reverse();
        tops.perMatch[key] = _.sortBy(playersArray, function(player){ return getStat(player, key, 'perMatch') }).reverse();
    });

    self.cdata.tops.set(tops);
}

/**
 * Returns stat from player object
 * If the stat is an average, it returns null if the number of attempts is under 10
 */
function getStat(player, key, statType) {
    if (!player.stats || !player.stats.compiled) return null;
    var stat = player.stats.compiled[statType][key];
    var statsToPurge = ["FG%", "3P%", "2P%", "FT%"];

    if (_.contains(statsToPurge, key)) {
        let attemptsKey = key.replace('%', 'A');
        if (player.stats.compiled.totals[attemptsKey] < 10) stat = null;
    }

    if (!stat) return null;
    return stat;
}

/**
 * Initialise stat tops with empty arrays
 * @return {obj} Stat tops
 */
function initTops() {
    var statsLabels = ["MC","FG","FGA","FG%","3P","3PA","3P%","2P","2PA","2P%","FT",
    "FTA","FT%","ORB","DRB","TRB","AST","STL","BLK","TO","FO","PTS", "EFF"];

    var tops = {
        totals: {},
        perMatch: {}
    }

    _.each(statsLabels, function(stat){
        tops.totals[stat] = [];
        tops.perMatch[stat] = [];
    });

    return tops;
}

function statUrls() {
    var html = '';
    var totals = ['points', 'rebounds'];
    var average = ['points'];

    _.each(totals, function(stat){
        html += "<a class="+stat+" href=#>"+_cap(stat)+"</a>"
    });

    return html;
}
/**
 * Initialize stat detail
 * @param  {[type]} statKey  [description]
 * @param  {[type]} statName [description]
 * @return {[type]}          [description]
 */
function statDetail(stat) {
    var key = classToKey(stat);
    var tpl = Template.instance();

    m.stat.set(stat);
    m.statSection.set(' - ' + statName(key));
    m.title.set(m.statSection.get() + ' - ' + m.statType.get('name'));

    toggleStatDetail();
    tpl.$('.show-summary').show();
}

function toggleStatDetail() {
    var tpl = Template.instance();
    tpl.$('.summary').toggle();
    tpl.$('.top-perstat').toggle();
}

function overview(statsType, half) {
    return overviewRows(statsLabels(half), statsType);
}

function overviewRows(statsOverview, statType) {
    var html = '';
    var tpl = Template.instance();
    var tops = tpl.cdata.tops.get();
    if (!tops || !tops.totals || !tops.perMatch) return;

    _.each(statsOverview, function(stat){
        let tp = tops[statType][stat.key][0];
        if (tp.stats && tp.stats.compiled) {
            html += "<tr>";
            html += "<th style=width:130px><a class='discrete "+ _statClass(stat.key) +"' href=#>" + stat.name + "</a></th>";
            html += "<td>" + tp.stats.compiled[statType][stat.key] + "</td>";
            html += "<td>" + _a('/players/', tp._id._str, tp.name + ' ' + tp.surname) + "</td>";
        }
    });

    return html;
}

function top(stat, statt) {
    var statKey = m.stat.get('key');
    var statName = m.stat.get('name');
    var html = '';
    var tpl = Template.instance();
    var tops = tpl.cdata.tops.get();
    var statType = m.statType.get('key');

    if (!tops || !tops.totals || !tops.perMatch) return;
    for (let i = 0; i<10; i++) {
        let tp = tops[statType][statKey][i];
        if (tp.stats && tp.stats.compiled) {
            let place = i+1;
            html += "<tr>";
            html += "<td style=width:175px>" + place + '. ' + _a('/players/', tp._id._str, tp.name + ' ' + tp.surname) + "</td>";
            html += "<td>" + tp.stats.compiled[statType][statKey] + "</td>";
            if (tp.team_id) {
                html += "<td>" + _a('/teams/', tp.team_id, tp.team_name) + "</td>";
            } else {
                html += "<td>" + "Unemployed" + "</td>";
            }
        }
    }
    return html;
}

function topOwn(stat, statt) {
    var statKey = m.stat.get('key');
    var statName = m.stat.get('name');
    var html = '';
    var tpl = Template.instance();
    var tops = tpl.cdata.tops.get();
    var statType = m.statType.get('key');
    var team_id = this.team._id._str;
    var counter = 0;

    if (!tops || !tops.totals || !tops.perMatch) return;

    for (let i = 10; i<tops[statType][statKey].length; i++) {
        let tp = tops[statType][statKey][i];
        let place = i+1;

        if (tp.stats && tp.stats.compiled && tp.stats.compiled[statType][statKey] && tp.team_id && team_id === tp.team_id._str) {
            html += "<tr>";
            html += "<td style=width:175px>" + place + '. ' + _a('/players/', tp._id._str, tp.name + ' ' + tp.surname) + "</td>";
            html += "<td>" + tp.stats.compiled[statType][statKey] + "</td>";
            html += "<td>" + _a('/teams/', tp.team_id, tp.team_name) + "</td>";
            counter ++;
        }

        if (counter === 10) break;
    }
    return html;
}

function statsLabels(half) {
    var stats = {
        first: [
            // {key:"MC", name:'Matches'},
            {key:"FG", name:'Field Goals'},
            {key:"FGA", name:'Field Goal Attempts'},
            {key:"FG%", name:'Field Goal %'},
            {key:"3P", name:"3 Points"},
            {key: "3PA", name:"3 Point Attempts" },
            {key: "3P%", name:"3 Point %" },
            {key: "2P", name:"2 Points" },
            {key: "2PA", name:"2 Point Attempts" },
            {key: "2P%", name:"2 Point %" },
            {key: "AST", name:"Assists" },
            {key: "STL", name:"Steals" }
        ],
        second: [
            {key: "FT", name:"Free Throws" },
            {key: "FTA", name:"Free Throw Attempts" },
            {key: "FT%", name:"Free Throw %" },
            {key: "ORB", name:"Offensive Rebounds" },
            {key: "DRB", name:"Defensive Rebounds" },
            {key: "TRB", name:"Total Rebounds" },
            {key: "BLK", name:"Blocks" },
            {key: "TO", name:"Turnovers" },
            {key: "FO", name:"Fouls" },
            {key: "PTS", name:"Points" },
            {key: "EFF", name:"Efficiency" }
        ]
    }
    stats.all = stats.first.concat(stats.second);

    return stats[half];
}

/**
 * Returns the full name of the stat based on the stat key
 * @param  {string} key Stat Key
 * @return {string}     Stat name
 */
function statName(key) {
    var stats = statsLabels('all');
    for (var i=0; i<stats.length; i++) {
        if (stats[i].key === key) {
            return stats[i].name;
        }
    }
}

function _statClass(stat) {
    var s = stat.replace('%', 'X');
    return s;
}

function classToKey(stat) {
    var s = stat.replace('X', '%');
    return s;
}

function _cap(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function _a(aroot, param, text) {
    return "<a class=discrete href=" + aroot + param + ">" + text + "</a>";
}



/* MODELS */
function models() {
    return {
        title: {
            init: function(title) {
                var tpl = Template.instance();
                tpl.data.title = new ReactiveVar('');
                this.set(title);
            },
            get: function() {
                var tpl = Template.instance();
                return tpl.data.title.get();
            },
            set: function(title) {
                var tpl = Template.instance();
                var base = tpl.data.leagueName;
                var newTitle = base + ' ' + title;

                tpl.data.title.set(newTitle);
            }
        },

        statType: {
            totals: {name: 'Totals', key: 'totals'},
            perMatch: {name: 'Per Match',key: 'perMatch'},
            current: {},

            init: function(statType) {
                var tpl = Template.instance();
                tpl.data.statType = new ReactiveVar('');
                this.set(statType);
            },
            get: function(prop) {
                if (!this.current[prop]) return this.current;
                return this.current[prop];
            },
            getReactive: function() {
                var tpl = Template.instance();
                return tpl.data.statType.get();
            },
            set: function(statType) {
                if (this[statType]) this.current = this[statType];

                var tpl = Template.instance();
                tpl.data.statType.set(this.current.name);
            }
        },

        stat: {
            current: {},
            init: function(statKey) {
                var tpl = Template.instance();
                tpl.data.stat = new ReactiveVar('');
                this.set(statKey);
            },
            get: function(prop) {
                if (!this.current[prop]) return this.current;
                return this.current[prop];
            },
            getReactive: function() {
                var tpl = Template.instance();
                return tpl.data.stat.get();
            },
            set: function(statKey) {
                var tpl = Template.instance();

                this.current = {
                    key: statKey,
                    name: statName(statKey)
                };

                tpl.data.stat.set(this.current.name);
            }
        },

        statSection: {
            current: '',

            init: function(name){this.set(name)},
            get: function() {
                return this.current;
            },
            set: function(name) {
                this.current = name;
            }
        }
    }
}