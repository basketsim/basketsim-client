var pwd = AccountsTemplates.removeField('password');

function countrySelector() {
    var listOfCountries = ["Greece", "Slovenia", "USA", "Italy", "Latvia", "Poland", "Spain", "Bosnia", "Serbia", "Estonia", "Lithuania", "France", "Turkey", "Croatia", "Philippines",
   "Romania", "Belgium", "Germany", "Israel", "Portugal", "Argentina", "Bulgaria", "Indonesia", "Finland", "FYR Macedonia", "United Kingdom", "Czech Republic",
   "Australia", "Uruguay", "Canada", "Hungary", "Switzerland", "Netherlands", "China", "Russia", "Slovakia", "Cyprus", "Brazil", "Chile", "Sweden", "Albania",
   "Venezuela", "Ukraine", "Montenegro", "Denmark", "Norway", "Ireland", "South Korea", "Malaysia", "Austria", "Malta", "Japan", "New Zealand", "Belarus", "Peru",
   "Thailand", "Mexico", "Colombia", "Hong Kong", "Puerto Rico", "Tunisia", "India", "Georgia", "Egypt"];

    listOfCountries.sort();
    var selector = [];
    _.each(listOfCountries, function(country){
        selector.push({
            value: country,
            text: country
        })
    });

    return selector;

}

AccountsTemplates.removeField('email');
AccountsTemplates.addFields([
    {
        _id: "username",
        type: "text",
        displayName: "username",
        required: true,
        minLength: 2
    },
    {
        _id: 'email',
        type: 'email',
        required: true,
        displayName: "email",
        re: /.+@(.+){2,}\.(.+){2,}/,
        errStr: 'Invalid email'
    },
    pwd
]);

AccountsTemplates.configure({
    // Behavior
    confirmPassword: true,
    enablePasswordChange: true,
    forbidClientAccountCreation: false,
    overrideLoginErrors: true,
    sendVerificationEmail: false,
    lowercaseUsername: false,
    focusFirstInput: true,

    // Appearance
    showAddRemoveServices: false,
    showForgotPasswordLink: true,
    showLabels: true,
    showPlaceholders: true,
    showResendVerificationEmailLink: false,

    // Client-side Validation
    continuousValidation: false,
    negativeFeedback: false,
    negativeValidation: true,
    positiveValidation: true,
    positiveFeedback: true,
    showValidating: true,

    // Privacy Policy and Terms of Use
    // privacyUrl: 'privacy',
    // termsUrl: 'terms-of-use',

    // Texts
    texts: {
      button: {
          signUp: "Register Now!"
      },
      socialSignUp: "Register",
      socialIcons: {
          "meteor-developer": "fa fa-rocket"
      },
      title: {
          forgotPwd: "Recover Your Password"
      },
    },
});