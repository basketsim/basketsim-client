import { Template } from 'meteor/templating';

Template.PlayerStatsCard.onCreated(function(){
    this.cdata = {};
    this.cdata.statType = new ReactiveVar('totals');
    this.cdata.title = new ReactiveVar('Stats Total');
});

Template.PlayerStatsCard.helpers({
    title: function () {
        var tpl = Template.instance();
        return tpl.cdata.title.get();
    },
    statType: function() {
        var tpl = Template.instance();
        return tpl.cdata.statType.get();
    }
});
Template.PlayerStatsCard.events({
    'click .stats-per-game': function (e) {
        e.preventDefault();
        var tpl = Template.instance();
        tpl.cdata.statType.set('perMatch');
        tpl.cdata.title.set('Stats Per Match');

        $('.stats-total').show();
        $('.stats-per-game').hide();
    },
    'click .stats-total': function (e) {
        e.preventDefault();
        var tpl = Template.instance();
        tpl.cdata.statType.set('totals');
        tpl.cdata.title.set('Stats Total');

        $('.stats-total').hide();
        $('.stats-per-game').show();
    }
});