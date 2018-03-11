import {Meteor} from 'meteor/meteor';

Meteor.startup(function() {
    setEmail();
    setFacebook();
});

function setEmail() {
    Accounts.emailTemplates.siteName = "Basketsim";
    Accounts.emailTemplates.from = "Basketsim <basketsim@basketsim.com>";

    var smtp = {
        username: Meteor.settings.mail.user,
        password: Meteor.settings.mail.password,
        server: Meteor.settings.mail.server,
        port: Meteor.settings.mail.port
    }

    process.env.MAIL_URL = 'smtp://' + encodeURIComponent(smtp.username) + ':' + encodeURIComponent(smtp.password) + '@' + encodeURIComponent(smtp.server) + ':' + smtp.port;

}

function setFacebook() {
    // Add Facebook configuration entry
    ServiceConfiguration.configurations.update(
      { "service": "facebook" },
      {
        $set: {
          "appId": Meteor.settings.fb.appId,
          "secret": Meteor.settings.fb.secret
        }
      },
      { upsert: true }
    );
}