import teamsModel from './../../../../teams/client/models/team-clientmodel.js';
import playersModel from './../../../../players/client/models/players-clientmodel.js';

/*Don't forget to check what happens when url is changed*/
Template.MatchOrders.onCreated(function(){
    var self = this;

    this.cdata = {
        team: new ReactiveVar(null),
        players: new ReactiveVar([]),
        tactics: new ReactiveVar(null),
        position: ''
    }

    if (this) updateData(this);
    refreshData(this);
});

Template.MatchOrders.onRendered(function(){
    toggleArrows();
});

Template.MatchOrders.helpers({
    positions: positions,
    playerOnPos: playerOnPos,
    savePosition: savePosition,
    pos: getPosition,
    displayOptions: displayOptions,
    defTactics: defTactics,
    offTactics: offTactics,
    selectStrategy: selectStrategy,
    selectedStrategy: selectedStrategy
});

Template.MatchOrders.events({
    'click .tactics-change-player': openChangePlayerModal,
    'click .tactics-strategy-selection': selectStrategy,
    'click .submit': submitTactics,
    'click .submit-default': submitDefaultTactics,
    'click .swap': swapTactics,
    'click .clear': clearTactics,
    'click .add-to-live': addToLive

});

function submitTactics(event) {
    event.preventDefault();
    var tactics = getTactics();
    Meteor.call('matches:submitTactics', this.match._id, tactics, function (error, result) {
        if (error) {
            sAlert.error(error.reason);
        } else {
            sAlert.success('Tactics have been submitted successfully');
        }
    });
}

function submitDefaultTactics(event) {
    event.preventDefault();
    var tactics = getTactics();
    Meteor.call('matches:submitDefaultTactics', tactics, function (error, result) {
        if (error) {
            sAlert.error(error.reason);
        } else {
            cbutils.events.fire('team:update');
            sAlert.success('Default tactics have been submitted successfully');
        }
    });
}

function swapTactics(event) {
    event.preventDefault();
    var tpl = Template.instance();
    var tactics = getTactics();

    var newTactics = {
        startingFive: {},
        subs: {},
        defensive: tactics.defensive,
        offensive: tactics.offensive
    };

    for (var stp in tactics.startingFive) {
        newTactics.subs[stp] = tactics.startingFive[stp]
    }
    for (var subp in tactics.subs) {
        newTactics.startingFive[subp] = tactics.subs[subp]
    }

    tpl.cdata.tactics.set(newTactics);
}

function clearTactics(event) {
    event.preventDefault();
    var tactics = getTactics();
    var tpl = Template.instance();

    for (var stp in tactics.startingFive) {
        tactics.startingFive[stp].player_id = null;
    }
    for (var subp in tactics.subs) {
        tactics.subs[subp].player_id = null;
    }

    tactics.defensive = 'normal';
    tactics.offensive = 'normal';

    tpl.cdata.tactics.set(tactics);
}

function addToLive(event) {
    event.preventDefault();

    Meteor.call('updateLive', this.match._id, function(error){
        if (error) {
            sAlert.error(error.reason);
        } else {
            sAlert.success('Good choice! Match can be seen live!');
        }
    });
}

function refreshData(tpl) {
    cbutils.events.on('team:update', function(){
        teamsModel.refreshOwn(function(team){
            tpl.cdata.team.set(team);
        });
    });
}

function selectStrategy(event) {
    event.preventDefault();
    var tpl = Template.instance();
    var tactics = tpl.cdata.tactics.get();
    console.log('selectStrategy', this);

    tactics[this.state] = this.val;
    tpl.cdata.tactics.set(tactics);
}

function selectedStrategy(state) {
    var tactics = getTactics();
    if (!tactics) return 'Normal';
    return toTitleCase(tactics[state]);
}

function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

function defTactics() {
    var tactics = [
        {val: 'normal', name: 'Normal', state:'defensive'},
        {val: 'sprint back on defense', name: 'Sprint Back On Defense', state:'defensive'},
        {val: 'contest every shot', name: 'Contest Every Shot', state:'defensive'},
        {val: 'block out and rebound', name: 'Block Out And Rebound', state:'defensive'},
        {val: 'protect power zone', name: 'Protect Power Zone', state:'defensive'},
        {val: 'wear out the opponents', name: 'Wear Out The Oponents', state:'defensive'},
        {val: 'half court trap', name: 'Half Court Trap', state:'defensive'}
    ];
    return tactics
}

function offTactics() {
    var tactics = [
        {val: 'normal', name: 'Normal', state:'offensive'},
        {val: 'read the defense', name: 'Read The Defense', state:'offensive'},
        {val: 'fast early breaks', name: 'Fast Early Breaks', state:'offensive'},
        {val: 'distance shooting', name: 'Distance Shooting', state:'offensive'},
        {val: 'try to penetrate', name: 'Try To Penetrate', state:'offensive'},
        {val: 'crash the boards', name: 'Crash The Boards', state:'offensive'},
        {val: 'inside shooting', name: 'Inside Shooting', state:'offensive'}
    ];
    return tactics;
}

function toggleArrows() {
    var poss = positions();
    var groups = ['STARTING', 'SUBS'];
    poss.forEach(function (pos) {
        groups.forEach(function (group) {
            let id = `-${pos}-${group}`;
            let collapse = '#collapse' + id;
            let arrowCl = '.arrow' + id;
            $(collapse).on('hide.bs.collapse', function () {
              $(arrowCl).removeClass('ion-chevron-up');
              $(arrowCl).addClass('ion-chevron-down');
            });

            $(collapse).on('show.bs.collapse', function () {
              $(arrowCl).addClass('ion-chevron-up');
              $(arrowCl).removeClass('ion-chevron-down');
            });
        });
    });
}


function openChangePlayerModal(event) {
    event.preventDefault();
    var tpl = Template.instance();
    Modal.show('EmptyModal', {
        modalName: `Choose your ${this.pos}`,
        modalContentName: 'OrdersModal',
        player: this.player,
        players: getPlayers(),
        position: this.pos,
        group: this.group,
        tactics: tpl.cdata.tactics
    });
}

function positions() {
    return ['PG', 'SG', 'SF', 'PF', 'C'];
}

function savePosition(position) {
    var tpl = Template.instance();
    tpl.cdata.position = position;
}

function getPosition() {
    var tpl = Template.instance();
    return tpl.cdata.position;
}

/**
 * Returns the player matching the position in the lineup from the cdata lineup
 * Check if this get updated automatically when the tactics are updated
 */
function playerOnPos(pos, group) {
    var tactics = getTactics();
    var matchPlayer = {};
    var player = {};
    var players = getPlayers();
    var pop = {
        player: null,
        pos: pos,
        group: group
    }

    if (!tactics) {
        pop.player = {
            _id: null,
        }
        return pop;
    }
    matchPlayer = tactics[group][pos];

    if (!matchPlayer.player_id) {
        pop.player = {
            _id: null,
        }
        return pop;
    }

    player = _.find(players, function(pl){
        return pl._id._str === matchPlayer.player_id._str;
    });

    pop.player = player;

    return pop;
}

function updateData(tpl){
    teamsModel.getOwn(function(team){
        tpl.cdata.team.set(team);
        getInitialTactics(tpl, team);
    });
    playersModel.getOwn(function(players){
        players = _.where(players, {coach:0});
        tpl.cdata.players.set(players);
    });
}

function getTeam() {
    var tpl = Template.instance();
    return tpl.cdata.team.get();
}

function getPlayers() {
    var tpl = Template.instance();
    return tpl.cdata.players.get();
}

function getTactics() {
    var tpl = Template.instance();
    return tpl.cdata.tactics.get();
}

function getInitialTactics(tpl, team) {
    var match = tpl.data.match;
    var own = match.ownTeam;
    var tactics = {};
    if (match[own].tacticsSet) {
        tactics = {
            defensive: match[own].defensive,
            offensive: match[own].offensive,
            startingFive: match[own].startingFive,
            subs: match[own].subs
        }
    } else if (team.tactics){
        tactics = team.tactics
    } else {
        tactics = emptyTacticsTeam();
    }

    tpl.cdata.tactics.set(tactics);
}

function emptyTacticsTeam() {
    var tactics = {
        startingFive: {},
        subs: {},
        defensive: 'normal',
        offensive: 'normal'
    };
    var positions = ['PG', 'SG', 'SF', 'PF', 'C'];
    positions.forEach(function (pos) {
        tactics.startingFive[pos] = {player_id: null}
        tactics.subs[pos] = {player_id: null}
    });

    return tactics;
}

function displayOptions() {
    return {
        playerFace: true
    }
}