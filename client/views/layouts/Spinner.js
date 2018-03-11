Template.Spinner.onCreated(function() {
        Meteor.Spinner.options = {
            className: 'spinner', // The CSS class to assign to the spinner
            zIndex: 1, // The z-index (defaults to 2000000000)
            scale: 1,
            lines: 12,
            length: 14,
            radius: 10,
            width: 3,
            speed: 2
    }
});