Accounts.registerLoginHandler(function(loginRequest) {
  //there are multiple login handlers in meteor.
  //a login request go through all these handlers to find it's login hander
  //so in our login handler, we only consider login requests which has admin field
  var userId;
  // console.log('UserInfo goosy: ', UserInfo.findOne({login_name: 'ionescug'}));
  var user = UserInfo.findOne({login_name: loginRequest.loginName});
  if(!user) {
    return undefined;
  } else {
    userId = user._id;
  }

  if (CryptoJS.MD5(loginRequest.oldPassword).toString() != user.password) {
    return undefined;
  } else {
    userId = user._id;
  }

  //send loggedin user's user id
  return {
    userId: userId._str
  };
});


//ALTERNATIVE - Don't offer new login system, only use old one - but what about the encryption and fb/google login?