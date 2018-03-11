Template.Landing.onRendered(function (argument) {
    $('header .header-shadow').removeClass('header-shadow');
    $('#content').css('margin-top', '89px');
});

Template.Landing.events({
    'click .join': function() {
        Modal.show('Modal', {
            modalName: 'Welcome to Basketsim!',
            modalContentName: 'RegisterModal',
            modalClass: 'login-form',
            maxWidth: '400px'
        });
    }
});