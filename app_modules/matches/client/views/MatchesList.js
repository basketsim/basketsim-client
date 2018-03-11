Template.MatchesList.onRendered(function(){

});

Template.MatchesList.helpers({
    getTime: function(timestamp) {
        return moment(timestamp).format('dddd, MMM Do YYYY, HH:mm');
    },
    noMatches: function(matches) {
        if (!matches[0]) return true;
        return false;
    },
    viewer: function (comp) {
        const competition = comp ? comp : this.competition.collection;
        if (competition === 'TestGE') {
            return `/match-viewer/${this._id}/home`;
        } else {
            return `/matches/${this._id}`;
        }
    },
    compLogo: function() {
        var comp = this.competition.collection;
        var logo = {
            img: '',
            background: ''
        };

        switch(comp) {
            case "NationalCups":
            logo = {
                img: "/resources/trophies/national-cup.png",
                background: '#005a8d'
            };
            break;

            // case "Leagues":
            // logo = {
            //     img: "/resources/trophies/silver-league.png",
            //     background: '#681a7e'
            // };
            // break;

            default:
            logo = {
                img: "/material/trophy-icon.png",
                background: ''
            };
            break;
        }

        return logo;
    }
});