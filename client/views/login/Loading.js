Template.Loading.rendered = function () {
  if ( ! Session.get('loadingSplash') ) {
    this.loading = window.pleaseWait({
      logo: '/material/web-size/bs-logo.png',
      backgroundColor: '#98011a',
      loadingHtml: message + spinner
    });
    Session.set('loadingSplash', true); // just show loading splash once
  }
};

Template.Loading.destroyed = function () {
  if ( this.loading ) {
    this.loading.finish();
  }
};

var message = '<p class="loading-message">Welcome to Basketsim 2.0!</p>';
var spinner =   '<div class="sk-spinner sk-spinner-wave">' +
				' <div class="sk-rect1"></div>' +
				' <div class="sk-rect2"></div>' +
				' <div class="sk-rect3"></div>' +
				' <div class="sk-rect4"></div>' +
				' <div class="sk-rect5"></div>' + '</div>';