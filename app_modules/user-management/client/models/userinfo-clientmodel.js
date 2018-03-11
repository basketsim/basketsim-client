import {Meteor} from 'meteor/meteor';
class UserInfoClientModel {
    getOwn(callback) {
        var userinfo = Session.get('userinfo');
        if (!userinfo) {
            Meteor.call('user-management:userinfo:getCurrentUserInfo', function (error, result) {
                if (error) {
                    // sAlert.error('There has been an error retrieving your user info. Please refresh and try again');
                } else {
                    Session.set('userinfo', result);
                    callback(result);
                }
            });
        } else {
            callback(userinfo);
        }
    }
    /**
     * Takes the id of the required user info and a callback as params
     * First, tries to check if the userInfo of the current user is known.
     * * If it is known fires getUserInfo, with the current, known, user info
     * * If it isn't known, first gets own and passes it to getUserInfo
     */
    getByID(userinfoID, callback) {
        var userinfo = Session.get('userinfo');
        if (userinfo) {
            getUserInfo(userinfo);
        } else {
            this.getOwn(function(result){
                getUserInfo(result);
            });
        }

        function getUserInfo(ownUserInfo) {
            if (userinfoID === ownUserInfo._id._str) {
                callback(ownUserInfo);
            } else {
                Meteor.call('user-management:userinfo:getByID', userinfoID, function (error, result) {
                    if (error) {
                        sAlert.error('There has been an error retrieving the user info. Please refresh and try again');
                    } else {
                        callback(result);
                    }
                });
            }
        }
    }
    isAccountVerified(callback) {
        Meteor.call('profile:isAccountVerified', function (err, verifiedAccount) {
            if (err) {
                sAlert.error('The account verification status is unavailable due to an error. If this persist, please file a bug report');
            } else {
                callback(verifiedAccount);
            }
        });
    }
}

export default new UserInfoClientModel();