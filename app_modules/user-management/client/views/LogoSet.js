import { Template } from 'meteor/templating'

Template.LogoSet.onCreated(function(){
    initData();
});

Template.LogoSet.events({
    'click .def-logo': selectLogo,
    'input .logo-upload, click .logo-upload': uploadLogo,
    'click .set-logo': setLogo
});


Template.LogoSet.helpers({
    rdata: function () {
        var tpl = Template.instance();
        return tpl.rdata.get();
    }
});

function initData() {
    var tpl = Template.instance();
    tpl.rdata = new ReactiveVar({logo:''});
}

function selectLogo(e) {
    e.preventDefault();
    var tpl = Template.instance();
    tpl.rdata.set({logo:e.target.attributes.src.value});
    $('.logo-preview').show();
}

function uploadLogo(e) {
    e.preventDefault();
    var tpl = Template.instance();
    var logo = $(e.target).val();
    var imgFormat = logo.slice(-3).toLowerCase();

    if (imgFormat === 'gif' || imgFormat === 'jpg' || imgFormat === 'png') {
        tpl.rdata.set({logo:logo});
        $('.logo-preview').show();
    }
}

function setLogo(e) {
    e.preventDefault();
    var tpl = Template.instance();
    var logo = tpl.rdata.get().logo;
    console.log('setLogo got logo', logo);
    var imgFormat = logo.slice(-3).toLowerCase();

    if (logo === '' || logo.length > 2083) {
        sAlert.error('No logo selected');
        return;
    }
    if (imgFormat === 'gif' || imgFormat === 'jpg' || imgFormat === 'png') {
        console.log('logo will be set', logo);
        Meteor.call('profile:setNewLogo', logo, function (error, result) {
            if (error) {
                sAlert.error(error.reason);
            } else {
                sAlert.success('You have successfuly changed your logo');
                refreshTeamSession(logo);
                Modal.hide('EmptyModal');
            }
        });
    } else {
        sAlert.error('Image format not supported. The logo needs to be jpg, png or gif');
        return;
    }
}

function refreshTeamSession(logo) {
    var team = Session.get('team');
    team.logo = logo;
    Session.set('team', team);
}
