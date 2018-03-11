var bcrypt = NpmModuleBcrypt;
var bcryptHash = Meteor.wrapAsync(bcrypt.hash);
var bcryptCompare = Meteor.wrapAsync(bcrypt.compare);

Meteor.methods({
    'migrate': function(loginRequest) {
        var newLoginRequest = {};
        var newUserId;
        var newUser;
        var oldPass = formattedOldPass(loginRequest.oldPassword);
        console.log('Account migration triggered.');



        user = UserInfo.findOne({ login_name : loginRequest.loginName});
        if (user) {
            if (user.password !== CryptoJS.MD5(oldPass).toString()) {
              return 'WRONG_PASSWORD';
            }
            userId = user._id;
            userIdString = user._id._str;
            user.password = loginRequest.oldPassword;

            newLoginRequest = {
                email: user.email,
                password: loginRequest.oldPassword
            };
        } else {
            return 'WRONG_LOGIN_NAME';
        }

        //CHECK IF USER EXISTS IN USERS TABLE
        userAccount = Meteor.users.findOne({userInfo_id: userId });
        console.log('userAccount: ', userAccount);
        if (!userAccount) {
            newUserId = createUser(user);
            return 'MIGRATION_SUCCESS';

        } else {
           return 'USER_EXISTS';
        }
    }
});

function formattedOldPass(pass) {
    var password = pass;
    password = password.replace(/ /g, '');
    password = addslashes(password);

    return password;
}

function addslashes(str) {
  //  discuss at: http://phpjs.org/functions/addslashes/
  // original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // improved by: Ates Goral (http://magnetiq.com)
  // improved by: marrtins
  // improved by: Nate
  // improved by: Onno Marsman
  // improved by: Brett Zamir (http://brett-zamir.me)
  // improved by: Oskar Larsson Högfeldt (http://oskar-lh.name/)
  //    input by: Denny Wardhana
  //   example 1: addslashes("kevin's birthday");
  //   returns 1: "kevin\\'s birthday"

  return (str + '')
    .replace(/[\\"']/g, '\\$&')
    .replace(/\u0000/g, '\\0');
}


function createUser(newUser) {
  // Unknown keys allowed, because a onCreateUserHook can take arbitrary
  // newUser
  var username = newUser.login_name;
  var email = newUser.email;
  var userInfo_id = newUser._id;
  if (!username && !email)
    throw new Meteor.Error(400, "Need to set a username or email");

  var user = {services: {}};
  if (newUser.password) {
    console.log('password unhashed', newUser);
    console.log('password unhashed', newUser.password);
    var hashed = hashPassword(newUser.password);
    console.log('password hashed:', hashed);
    user.services.password = { bcrypt: hashed };
  }

  if (username)
    user.username = username; //this is actually login name, as it is not possible to login with username
  if (email)
    user.emails = [{address: email, verified: false}];
  if (userInfo_id)
    user.userInfo_id = userInfo_id;

  return Accounts.insertUserDoc(newUser, user);
}

var hashPassword = function (password) {
  password = getPasswordString(password);
  console.log('password string: ', password);
  return bcryptHash(password, Accounts._bcryptRounds);
};

var getPasswordString = function (password) {
  if (typeof password === "string") {
    password = SHA256(password);
  } else { // 'password' is an object
    if (password.algorithm !== "sha-256") {
      throw new Error("Invalid password hash algorithm. " +
                      "Only 'sha-256' is allowed.");
    }
    password = password.digest;
  }
  return password;
};