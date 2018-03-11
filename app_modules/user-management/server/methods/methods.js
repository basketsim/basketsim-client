import { Meteor } from 'meteor/meteor';
import inactiveCleaner from './../actions/inactive_cleaner.js';
import sbutils from './../../../utils/server/api.js';
import userModel from './../models/user-model.js';

Meteor.methods({
    'user_management:inactive_cleaner:mark': markForRemoval,
    'user_management:inactive_cleaner:remove': remove,
    'user_management:inactive_cleaner:inspectRemoval': inspectRemoval,
    'user_management:emailValidation': emailValidation
});

function markForRemoval() {
    if (!sbutils.validations.isAdmin(this.userId)) return;
    inactiveCleaner.markForRemoval();
}

function remove() {
    if (!sbutils.validations.isAdmin(this.userId)) return;
    inactiveCleaner.remove();
}

function inspectRemoval() {
    if (!sbutils.validations.isAdmin(this.userId)) return;
    inactiveCleaner.inspectRemoval();
}

function emailValidation(email) {
    if (!sbutils.validations.isAdmin(this.userId)) throw new Meteor.Error('no-rights', 'You are not allowed to perform this operation');
    if (!email) throw new Meteor.Error('invalid-arguments', 'Email field is empty');
    userModel.setEmailValidity(email, true);
}