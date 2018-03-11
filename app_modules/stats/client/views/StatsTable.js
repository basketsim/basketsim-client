import { Template } from 'meteor/templating';
import statsData from './../data/stats.js';

var statsLabels = ["MC","EFF","FG","FGA","FG%","3P","3PA","3P%","2P","2PA","2P%","FT",
"FTA","FT%","ORB","DRB","TRB","AST","STL","BLK","TO","FO","PTS"];

Template.StatsTable.helpers({
    statsTable: _statsTable
});

Template.StatsTable.onCreated(function(){
    var self = this;
    this.cdata = {};
});

Template.StatsTable.onRendered(function(){
    $('[data-toggle="tooltip"]').tooltip();
});

/**
 * Format data from stats object
 * Generate html table based on the data
 */
function _statsTable() {
    var tpl = Template.instance();
    tpl.cdata.compiledStats = statsData(tpl.data.stats);
    var stats = tpl.cdata.compiledStats[tpl.data.statType];

    var table = '';
    var spacer = false;

    _.each(_.sortBy(stats, 'season').reverse(), function(season, seasonNum){
        if (spacer) table += _spacer(statsLabels.length+1);
        _.each(season.range, function(comp){
            table += '<tr>';
            table += '<th>' + comp.name + '</th>';
            _.each(statsLabels, function(key){
                table += '<td align="center">' + butils.math.twoDecs(comp.stats[key]) + '</td>';
            });
            table += '</tr>';
        });

        spacer = true;
    });

    return table;
}

function _spacer(columns) {
    var html = '<tr>';
    for (var i=0; i<columns; i++) {
        html += '<td style="height: 25px"></td>';
    }
    html += '</tr>'

    return html;
}