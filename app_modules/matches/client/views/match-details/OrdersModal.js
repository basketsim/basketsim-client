Template.OrdersModal.onCreated(function(){
});

Template.OrdersModal.onRendered(function(){
    toggleArrows(this);
    console.log('OrdersModal rendered', this.$('.card-title'));

});

Template.OrdersModal.helpers({
    listHeight: getListHeight,
    displayOptions: displayOptions,
    displayOptionsFace: displayOptionsFace,
    playerPosition: playerPosition,
    formatGroup: formatGroup,
    cutString: cutString,
    fullName: fullName
});

Template.OrdersModal.events({
    'click .card-close': prevDef,
    'click .card-close-btn': hideModal,
    'click .tactics-change-player': assignPlayer
});

function getListHeight() {
    return 0.58 * screen.height;
}

function fullName() {
    var full = this.name + ' ' + this.surname;
    return cutString(full);
}

function hideModal(event) {
    if (event) event.preventDefault();
    Modal.hide('OrdersModal');
}

function prevDef(event) {
    event.preventDefault();
}

function assignPlayer(event) {
    event.preventDefault();
    var tpl = Template.instance();
    var tactics = tpl.data.tactics.get();
    var group = tpl.data.group;
    var pos = tpl.data.position;

    removePlayerID(tactics, this._id)
    tactics[group][pos].player_id = this._id;

    tpl.data.tactics.set(tactics);
    hideModal();
}

function removePlayerID(tactics, playerID) {
    for (let pos in tactics.startingFive) {
        if (tactics.startingFive[pos].player_id && tactics.startingFive[pos].player_id._str === playerID._str) {
            tactics.startingFive[pos].player_id = null;
        }
    }
    for (let pos2 in tactics.subs) {
        if (tactics.subs[pos2].player_id && tactics.subs[pos2].player_id._str === playerID._str) {
            tactics.subs[pos2].player_id = null;
        }
    }
}

function playerPosition(player) {
    var tpl = Template.instance();
    var tactics = tpl.data.tactics.get();
    var position = '';

    for (let pos in tactics.startingFive) {
        if (tactics.startingFive[pos].player_id && tactics.startingFive[pos].player_id._str === player._id._str) {
            position = 'Start ' + pos;
        }
    }
    for (let pos2 in tactics.subs) {
        if (tactics.subs[pos2].player_id && tactics.subs[pos2].player_id._str === player._id._str) {
            position = 'Sub ' + pos2;
        }
    }

    return position;
}

function formatGroup(gr) {
    if (gr === 'subs') return 'substitute';
    if (gr === 'startingFive') return 'starting'
}

function displayOptions() {
    return {
        playerFace: false
    }
}
function displayOptionsFace() {
    return {
        playerFace: true,
        actionPanel: false
    }
}

function cutString(str) {
    var ratio = 16; //16 px per character
    var lenght = parseInt(screen.width/ratio) - 3;
    var strLength = str.length;
    if (screen.width < 500) {
        str = str.substring(0, lenght);
        if (str.length < strLength) str = str + '\u2026';
    }

    return str;
}

function toggleArrows(tpl) {
    tpl.data.players.forEach(function (player) {
        let id = `-${player._id._str}-players`;
        let collapse = '#collapse' + id;
        let arrowCl = '.arrow' + id;
        $(collapse).on('hide.bs.collapse', function () {
          $(arrowCl).removeClass('ion-chevron-up');
          $(arrowCl).addClass('ion-chevron-down');
        });

        $(collapse).on('show.bs.collapse', function () {
          $(arrowCl).addClass('ion-chevron-up');
          $(arrowCl).removeClass('ion-chevron-down');
        });
    });

    $('#collapse-selected').on('hide.bs.collapse', function () {
      $('.arrow-collapse-player').removeClass('ion-chevron-up');
      $('.arrow-collapse-player').addClass('ion-chevron-down');
    });

    $('#collapse-selected').on('show.bs.collapse', function () {
      $('.arrow-collapse-player').addClass('ion-chevron-up');
      $('.arrow-collapse-player').removeClass('ion-chevron-down');
    });

}