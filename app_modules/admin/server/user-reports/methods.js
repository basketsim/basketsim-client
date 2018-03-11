import utils from '../../../news/server/utils.js'
Meteor.methods({
    'admin:user-reports:abuse': reportAbuse
});

function reportAbuse(reportedTeamID, reportedFor) {
    var reporterID = this.userId;
    var reporter = Meteor.users.findOne({_id: this.userId});
    var reporterInfo = UserInfo.findOne({_id: reporter.userInfo_id}, {fields: {username:1}});
    var receiver_id = butils.general.myTeamID();

    var type = 'report-abuse';
    var event = utils.newEvent('admin', receiver_id);
    event.info = {
        reportedTeamID: reportedTeamID,
        reportedFor: reportedFor,
        reporter: {
            name: reporterInfo.username,
            _id: reporterInfo._id
        }
    };
    event.type = type;
    Events.insert(event);
}