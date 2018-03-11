// Meteor.call('sendEmail',email,content);

Meteor.methods({
  sendEmail: function(address){
    if (this.userId!=='wg2H3Bem7BrERkEsZ') return;
    var emails = [];
    var userInfoEmails = [];

    if (address === 'allUsers') {
        userInfoEmails = UserInfo.find({}, {fields:{email:true}}).fetch();
        _.each(userInfoEmails, function(ue){
            emails.push(ue.email);
        });
    } else {
        emails.push(address);
    }

    console.log('email address', emails);

    _.each(emails, function(email){

    });
  }
});