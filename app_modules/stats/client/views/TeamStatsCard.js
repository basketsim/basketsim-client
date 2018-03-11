import { Template } from 'meteor/templating';

Template.TeamStatsCard.onCreated(function(){
    this.data.statType = new ReactiveVar('totals');
    this.data.title = new ReactiveVar('Stats Total');
});

Template.TeamStatsCard.helpers({
    title: function () {
        var tpl = Template.instance();
        return tpl.data.title.get();
    },
    getStatType: function() {
        return this.statType.get();
    }
});
Template.TeamStatsCard.events({
    'click .stats-per-game': function (e) {
        e.preventDefault();
        var tpl = Template.instance();
        tpl.data.statType.set('perMatch');
        tpl.data.title.set('Stats Per Match');

        $('.stats-total').show();
        $('.stats-per-game').hide();
    },
    'click .stats-total': function (e) {
        e.preventDefault();
        var tpl = Template.instance();
        tpl.data.statType.set('totals');
        tpl.data.title.set('Stats Total');

        $('.stats-total').hide();
        $('.stats-per-game').show();
    }
});