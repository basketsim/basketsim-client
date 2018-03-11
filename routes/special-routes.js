Router.route('verify-email/:token', {
    action: function() {
        Accounts.verifyEmail(this.params.token, function(err){
            if(!err) {
                Router.go('/club');
                setTimeout(function(){
                    sAlert.success('Your email has been validated. Thanks for joining and enjoy!');
                }, 3000);
            } else {
                Router.go('/club');
                setTimeout(function(){
                    sAlert.success('Your email has been validated. Thanks for joining and enjoy!');
                }, 3000);
            }
        });
    }
});

Router.route('reset-password/:paramToken', {
    action: function() {
        this.render('Landing');
        AccountsTemplates.paramToken = this.params.paramToken;
        Modal.show('Modal', {
            modalName: 'Reset your password',
            modalContentName: 'ResetPasswordModal',
            modalClass: 'login-form',
            maxWidth: '400px'
        });
    }
});