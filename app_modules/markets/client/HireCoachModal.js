import cbutils from './../../utils/client/api.js';
Template.HireCoachModal.helpers({
    coachWarning: function() {
        var team_id = Session.get('team')._id;
        var currCoach = Players.findOne({coach:1, team_id: team_id});
        if (currCoach) {
            return 'Your current coach, ' + decodeHtml(currCoach.name) + ' ' + decodeHtml(currCoach.surname) + ', will be fired automatically';
        } else {
            return '';
        }
    },
    dotify: cbutils.general.dotify
});
Template.HireCoachModal.events({
    'click .hire-coach': hireCoach
});

function hireCoach(event) {
    event.preventDefault();
    var self = this;
    Meteor.call('hireCoach', this.coach._id, function(error, success){
        if (error) {
            sAlert.error(error.reason);
        } else {
            Modal.hide('HireCoachModal');
            Router.go('/training?r=1');
        }
    });
}

/*Maybe I can use this to decode all names*/
function decodeHtml(html) {
    var txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}