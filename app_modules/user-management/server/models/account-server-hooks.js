import {Meteor} from 'meteor/meteor';

Accounts.validateLoginAttempt(function(attempt) {
    if (attempt.user.locked) throw new Meteor.Error('account-locked', 'Your account has been suspended for cheating and it will be deleted soon. If you believe this was a mistake, contact basketsim@basketsim.com and provide your arguments.');
    return attempt.allowed;
});