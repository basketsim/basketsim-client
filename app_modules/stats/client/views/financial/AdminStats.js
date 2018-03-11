import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';

Template.AdminStats.events({
    'click .average-salaries-level': getAverageSalariesPerLevel
});

function getAverageSalariesPerLevel(e) {
    e.preventDefault();
    console.log('getAverageSalariesPerLevel');
    Meteor.call('stats:financial:teams-average-salaries', function (error, result) {
        console.log(error, result);
    });
}