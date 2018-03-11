Template.CoachMarket.onRendered(function() {
    var self = this;

    var players = Players.find({coach:1, team_id:null}).fetch();
    var formatted = [];
    _.each(players, function(player){
        let fullname = decodeHtml(player.name + ' ' + player.surname);
        player.fullname = fullname;
        player.experience = Math.floor(player.experience/8);
        player.priceReadable = cbutils.general.dotify(player.price);
    });

    $('#table').bootstrapTable({
        columns: [{
            field: 'fullname',
            title: 'Name',
            sortable: true,
            formatter: function(value, row, index) {
                return '<a href="#" class="coach-name" data-id=' + row._id._str + '>' + value + '</a>';
            }
        }, {
            sortName: 'price',
            field: 'priceReadable',
            title: 'Price',
            sortable: true,
            align: 'center'
        }, {
            field: 'wage',
            title: 'Wage',
            sortable: true,
            align: 'center'
        },{
            field: 'seniorAbility',
            title: 'Senior Ab.',
            sortable: true,
            align: 'center'
        },{
            field: 'youthAbility',
            title: 'Youth Ab.',
            sortable: true,
            align: 'center'
        },{
            field: 'experience',
            title: 'Exp',
            sortable: true,
            align: 'center'
        },{
            field: 'age',
            title: 'Age',
            sortable: true,
            align: 'center'
        },{
            field: 'character',
            title: 'Character',
            sortable: true,
            align: 'center'
        },{
            field: 'country',
            title: 'Country',
            sortable: true,
            align: 'center'
        }],
        data: players,
        classes: 'table table-striped table-hover table-no-bordered'
        // onClickCell: function(field, value, row, $element) {
        //     event/
        //     console.log('clicked row', row, el);
        // }
    });
});
Template.CoachMarket.events({
    'click .coach-name': function(event) {
        event.preventDefault();
        var coach = Players.findOne({_id: new Mongo.ObjectID($(event.target).data('id'))});
        Modal.show('Modal', {
            modalName: 'Coach Info',
            modalContentName: 'HireCoachModal',
            coach: coach
        });
    }
});

/*Maybe I can use this to decode all names*/
function decodeHtml(html) {
    var txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}
