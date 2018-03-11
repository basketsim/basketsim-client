var external = false;
var curRound = null;
Template.LeagueMatches.helpers({
    getTime: function(timestamp) {
        return moment(timestamp).format('dddd, MMM Do YYYY, HH:mm');
    },
    score: function() {
        if (this.homeTeam.matchRatings && this.awayTeam.matchRatings) {
            return this.homeTeam.matchRatings.score + ' - ' + this.awayTeam.matchRatings.score;
        } else {
            return `<a href="#" title="Add match to live" style="font-weight: 600;font-size: 13px;" class="add-to-live">ADD TO LIVE</a>`
        }

    },
    md: function() {
        var tpl = Template.instance();
        var md = tpl.data.md;
        if (!md) md = 12;

        return md;
    },
    compLogo: function() {
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
                height: '53px',
                background: '#005a8d'
            };
            break;

            case "Leagues":
            let img = '/resources/trophies/silver-league.png';
            let brightness = "-webkit-filter: brightness(90%); filter: brightness(90%);";

            if (level === 1) {
                img = '/resources/trophies/gold-league.png';
                brightness = "-webkit-filter: brightness(100%); filter: brightness(100%);"
            }
            logo = {
                img: img,
                height: '50px',
                background: '#681a7e',
                margin: 'margin-top:7px',
                brightness: brightness
            };
            break;

            default:
            logo = {
                img: "/material/trophy-icon.png",
                height: '40px',
                background: ''
            };
            break;
        }

        return logo;
    }
});

Template.LeagueMatches.events({
    'click .add-to-live': addToLive
});

function addToLive(event) {
    event.preventDefault();

    Meteor.call('updateLive', this._id, function(error){
        if (error) {
            sAlert.error(error.reason);
        } else {
            sAlert.success('Good choice! Match can be seen live!');
        }
    });
}