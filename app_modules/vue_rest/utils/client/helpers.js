function initComponent(component, el, props) {
  var interval = setInterval(function () {
    if (!$(el)[0]) return;
    component(el, props);
    clearInterval(interval);
  }, 100);
}

export { initComponent };