window.bsim = {};
bsim.tools = {
    setActiveMenus: function (menu, submenu) {
        Session.set('tab', menu);
        Session.set('submenu', submenu);
    }
};