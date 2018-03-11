Template.Cup.helpers({
    getMatches: function() {
        var tpl = Template.instance();

        console.log('tpl matches get', tpl.matches.get());
        if (tpl.matches) {
            return tpl.matches.get();
        }
    },
    rounds: function() {
        return _rounds();
    },
    selectedSeason: function() {
        var tpl = Template.instance();
        return tpl.data.season;
    },
    loading: function() {
        var tpl = Template.instance();
        return tpl.loading.get();
    },
    cup: function(){
        var tpl = Template.instance();
        return tpl.cup.get();
    },
    country: function() {
        return _formatCountry(this.country);
    },
    cupPath: cupPath,
    leaguePath: leaguePath,
    leagueName: getLeagueName
});

Template.Cup.events({
    'click .round': function (e) {
        var tpl = Template.instance();
        tpl.changedRound = true;
        tpl.loading.set(true);

        setTimeout(function(){
            if (tpl.changedRound) {
                _fetchMatches(tpl);
            }
        },100);

    }
});

Template.Cup.onCreated(function() {
    var self = this;
    this.cdata = {
        leagueName: new ReactiveVar('')
    }

    this.matches = new ReactiveVar([]);
    this.cup = new ReactiveVar(null);
    this.loading = new ReactiveVar(true);
    Meteor.call('competitions:national-cup:get-cup', _formatCountry(this.data.country), function (err, res) {
        if (!err && res && res.seasons[self.data.season]) {
            self.cup.set(res);
            _fetchMatches(self)
        }
    });
});

function cupPath() {
    let country = this.country;
    let season = this.season;
    return `/national/cup/${country}/1/${season}`;
}

function leaguePath() {
    var prevLeaguePath = Session.get('param-league-path');
    var tpl = Template.instance();
    if (!prevLeaguePath) {
        let country = this.country;
        let season = this.season;
        Meteor.call('competitions:newLeagues:nameByCountryLevel', _formatCountry(country), 1, function (error, name) {
            if (error) {
                tpl.cdata.leagueName.set(`${_formatCountry(country)} 1.1`);
            } else {
                tpl.cdata.leagueName.set(`${_formatCountry(country)} ${name}`);
            }
        });
        return `/national/leagues/${country}/1/1/${season}`;
    } else {
        let params = prevLeaguePath.split('/');
        let l = params.length;
        var data = {
            country: params[l-4],
            level: parseInt(params[l-3]),
            series: parseInt(params[l-2]),
            season: params[l-1]
        };
        if (data.level === 1) {
            Meteor.call('competitions:newLeagues:nameByCountryLevel', _formatCountry(data.country), data.level, function (error, name) {
                if (error) {
                    tpl.cdata.leagueName.set(`${_formatCountry(data.country)} ${data.level}.${data.series}`);
                } else {
                    tpl.cdata.leagueName.set(`${_formatCountry(data.country)} ${name}`);
                }
            });
        } else {
            tpl.cdata.leagueName.set(`${_formatCountry(data.country)} ${data.level}.${data.series}`);
        }

        return `/national/leagues/${data.country}/${data.level}/${data.series}/${data.season}`;
    }
}

function getLeagueName() {
    var tpl = Template.instance();
    return tpl.cdata.leagueName.get();
}

function _fetchMatches(self) {
    self.changedRound = false;
    var seasonNum = self.data.season;
    var roundNum = self.data.round;
    var matchIDs = [];
    if (self.cup.get().seasons[seasonNum].rounds[roundNum]) {
        matchIDs = self.cup.get().seasons[seasonNum].rounds[roundNum].matches;
    }

    Meteor.call('competitions:national-cup:get-matches', matchIDs, function(err, res){
        _.each(res.teams, function(team){
            Teams._collection.remove(team._id);
            Teams._collection.insert(team);
        });
        _.each(res.matches, function(m){
            _inserOrReplaceMatch(m);
        });
        self.matches.set(_composedMatches(res.matches));
        self.loading.set(false);
    });
}

function _rounds() {
        var tpl = Template.instance();
        var cup = tpl.cup.get();
        var length = cup.seasons[tpl.data.season].info.rounds;
        var rounds = [];

        for (var i=1; i<=length; i++) {
            if (i === length) {
                rounds.push({name: 'Final', round:i});
            } else if (i === length-1) {
                rounds.push({name: 'Semi-Finals', round:i});
            } else if (i === length-2) {
                rounds.push({name: 'Quarter-Finals', round:i});
            } else {
                rounds.push({name: 'Round '+i, round:i});
            }
        }

        return rounds;
}

function _inserOrReplaceMatch(m) {
    Matches._collection.remove(m._id);
    Matches._collection.insert(m);
}

/** Possible tooling function here */
function _composedMatches(matches) {
    var composed = [];
    var teams = ['homeTeam', 'awayTeam'];
    _.each(matches, function(match){
        _.each(teams, function(team){
            let t = Teams.findOne({_id: match[team].id});
            let name = '';
            if (t) name = t.name;
            match[team].name = name;
        });
        composed.push(match);
    });

    return composed;
}

function _formatCountry(country) {
    country = _removeSlash(country);
    country = _toTitleCase(country);
    if (country === 'Usa') country = 'USA';
    if (country === 'Fyr Macedonia') country = 'FYR Macedonia';

    return country;
}

function _removeSlash(str) {
    return str.split('-').join(' ');
}

function _toTitleCase(str)
{
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}