/**
 * Template Display Options (tpl.data.display)
 *  * competionName - display comp name under the trophy
 *  * ordersState - display orders state
 */
Template.Matches.onRendered(function(){
    console.log('Matches template options', this)
});

Template.Matches.helpers({
    getTime: getTime,
    matchState: matchState,
    competition: competition,
    compLogo: compLogo
});

function getTime(timestamp) {
    return moment(timestamp).format('dddd, MMM Do YYYY, HH:mm');
}

function competition(col) {
    switch (col) {
        case 'Playoffs': return 'PLAYOFF';
        case 'NationalCups': return 'CUP';
        case 'Leagues': return 'LEAGUE';
        default: return '';
    }
}

function compLogo() {
        var comp = this.competition.collection;
        var level = this.competition.level;
        var logo = {
            img: '',
            background: ''
        };

        switch(comp) {
            case "NationalCups":
            logo = {
                img: "/resources/trophies/national-cup.png",
                height: '40px',
                background: '#005a8d',
                margin: 'margin-bottom:1px'
            };
            break;

            case "Leagues":
            let img = '/resources/trophies/silver-league.png';
            let brightness = "-webkit-filter: brightness(92%); filter: brightness(92%);"
            if (level === 1) {
                img = '/resources/trophies/gold-league.png';
                brightness = "-webkit-filter: brightness(100%); filter: brightness(100%);"
            }
            logo = {
                img: img,
                height: '38px',
                background: '#681a7e',
                margin: 'margin-top:7px',
                brightness: brightness
            };
            break;

            default:
            logo = {
                img: "/material/trophy-icon.png",
                height: '38px',
                background: ''
            };
            break;
        }

        return logo;
}

/**
 * Compute info to be displayed based on the match state. There are 3 states
 * Match not started (will display tactics info)
 * Match playing (will display link to match)
 * Match finished (will display score)
 */
function matchState() {
    var tpl = Template.instance();
    if (!this.state.simulated && tpl.data.display.ordersState) {
        return notStarted(this);
    } else if (this.state.simulated && !this.state.finished) {
        return playing(this);
    } else if (this.state.simulated && this.state.finished) {
        return finished(this);
    }
}

function notStarted(match) {
    var otm = {},
        tpl = {},
        ownTeam = {},
        txt = '';

    tpl = Template.instance();
    ownTeam = tpl.data.ownTeam;
    otm = getOwnTeamMatch(match);

    if (!otm) return '';

    if (otm.tacticsSet) {
        txt = `<a title="Set Match Orders" class="discrete" style="font-weight:400;" href="/matches/${match._id}">Has Match Orders <span style="color:#079648" class="match-action-icon ion-android-checkbox-outline"></span></a>`;
    } else if (ownTeam.tactics) {
        txt = `<a title="Set Match Orders" class="discrete" style="font-weight:400;" href="/matches/${match._id}">Using Default Orders <span class="match-action-icon ion-tshirt-outline"></span></a>`;
    } else {
        txt = `<a title="Set Match Orders" class="discrete" style="font-weight:400;" href="/matches/${match._id}">Team Has No Orders <span style="color:red" class="match-action-icon ion-android-checkbox-outline-blank"></span></a>`;
    }
    return txt;
}

function playing(match) {
  let href = `/match-viewer/${match._id}/home`;
  // if (match.competition.collection === 'TestGE') {
  //   href = `/match-viewer/${match._id}/home`;
  // } else {
  //   href = `/matches/${match._id}`;
  // }
  return `<a title="View Live Match" style= "font-weight:400; color:#c21315" href="${href}">WATCH LIVE <span style="color:#c21315; padding-right:2px" class="blink match-action-icon ion-ios-basketball"></span></a>`;
}

function finished(match) {
    console.log('finished is called');
    var own = whichIsOwn(match);
    var hasWon = ownHasWon(own, match);
    var color = '#d82323';
    if (hasWon) color = '#0f9a50';
    let href = `/match-viewer/${match._id}/home`;
    // if (match.competition.collection === 'TestGE') {
    //     href = `/match-viewer/${match._id}/home`;
    // } else {
    //     href = `/matches/${match._id}`;
    // }
    return `<a style = "font-weight:400; color:${color}" href="${href}">${match.homeTeam.matchRatings.score} - ${match.awayTeam.matchRatings.score}</a>`;
}

function getOwnTeamMatch(match) {
    var tpl = Template.instance();
    var ownTeam = tpl.data.ownTeam;
    if (!ownTeam) return null;
    if (match.awayTeam.id._str === ownTeam._id._str) {
        return match.awayTeam;
    } else if (match.homeTeam.id._str === ownTeam._id._str) {
        return match.homeTeam;
    } else {
        return null;
    }
}

function whichIsOwn(match) {
    var tpl = Template.instance();
    var ownTeam = tpl.data.ownTeam;
    if (!ownTeam) return null;
    if (match.awayTeam.id._str === ownTeam._id._str) {
        return 'awayTeam';
    } else if (match.homeTeam.id._str === ownTeam._id._str) {
        return 'homeTeam';
    } else {
        return null;
    }
}

function ownHasWon(own, match) {
    var other = '';
    if (own === 'awayTeam') other = 'homeTeam';
    if (own === 'homeTeam') other = 'awayTeam';

    if (match[own].matchRatings.score > match[other].matchRatings.score) return true;
    return false;
}