Accounts.validateNewUser(function (user) {
    console.log('user', user);
    validateSocial(user);
    validateEmail(user);
    return true;
});

function validateSocial(user) {
    var service = user.services.google || user.services.facebook;

    if (! service) {
          return true;
    }

    var email = service.email;

    if (!email){
        return true;
    }

    var existingUser = Meteor.users.findOne({$or: [{'emails.address': email}, {'services.google.email': email}, {'services.facebook.email': email}]});

    if (!existingUser){
        return true;
    }

    if (user.services.google) {
      Meteor.users.update({_id: existingUser._id}, {
        $set: {
          'profile': user.profile,
          'services.google': user.services.google
        }
      });
    } else if (user.services.facebook) {
      Meteor.users.update({_id: existingUser._id}, {
        $set: {
          'profile': user.profile,
          'services.facebook': user.services.facebook
        }
      });
    };
    return true;
}

function validateEmail(user){
    if (!user.emails) return true;
    var email = user.emails[0].address;
    if (!email) return true;
    var existingUser = Meteor.users.findOne({$or: [{'emails.address': email}, {'services.google.email': email}, {'services.facebook.email': email}]});

    if (existingUser) {
        if (existingUser.services.google) {
            throw new Meteor.Error('email-exists', 'The email you are trying to use is already used with Gmail login. Please try logging in directly with Gmail instead');
        } else if (existingUser.services.facebook) {
            throw new Meteor.Error('email-exists', 'The email you are trying to use is already used with Facebook login. Please try logging in directly with Facebook instead');
        } else {
            throw new Meteor.Error('email-exists', 'The email you are trying to use is already in use');
        }
    } else {
        return true;
    }
}