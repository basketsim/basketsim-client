Template.TransferList.onCreated(function(){
    Meteor.call('searchTransfers', Session.get('searchFilter'),
        function (error, result) {
            if (error) {
                sAlert.error('There have been an error, please try again. If the error persists, please file a bug report on the forum.');
            } else {
                _.each(result, function(el){
                    // cTransfers.insert(el);
                });

                createTable(result);
            }
        });
});

function formatPrice(price) {
    var mil = 1000000;

    if (price < 1000) return price;
    if (price < mil) return parseInt(price/1000)+'k';
    if (price >=mil) {
        price = parseInt(price/mil * 10);
        return price/10 + 'm';
    }

}

function createTable(transfers) {
    var self = this;

    var formatted = [];
    _.each(transfers, function(transfer){
        var skills = ['handling', 'quickness', 'passing', 'dribbling', 'rebounds', 'positioning', 'shooting', 'defense', 'experience', 'workrate', 'freethrow'];
        let fullname = decodeHtml(transfer.player.name[0] + '. ' + transfer.player.surname);
        var sum = 0;
        transfer.player.fullname = fullname;
        _.each(skills, function(skill){
            transfer.player[skill] = Math.floor(transfer.player[skill]/8);
            if (skill !== 'workrate' && skill !== 'experience') sum = sum + transfer.player[skill];
        });
        transfer.player.totalSkill = sum;
        transfer.readableExpire = moment(transfer.timestamps.expire).from(moment().valueOf());
        transfer.price.endReadable = formatPrice(transfer.price.end);
        transfer.player.readableEV = formatPrice(transfer.player.ev);
        transfer.player.readableWage = formatPrice(transfer.player.wage);
        transfer.player.weight = parseInt(transfer.player.weight);
    });

    $('#table').bootstrapTable({
        columns: [{
            field: 'player.surname',
            title: 'Surname',
            titleTooltip: 'Surname',
            sortable: true,
            formatter: function(value, row, index) {
                return '<a href=/players/' + row.player._id._str + '>' + value + '</a>';
            },
            class: 'trlist table-first-row'
        },{
            field: 'position',
            title: '<span class="ion-ios-basketball"></span>',
            titleTooltip: 'Playing position',
            sortable: true,
            align: 'center'
        },{
            sortName: 'price.end',
            field: 'price.endReadable',
            title: 'Price',
            titleTooltip: 'Price',
            sortable: true,
            align: 'center'
        },{
            field: 'player.totalSkill',
            title: 'TS',
            titleTooltip: 'Total Skill',
            sortable: true,
            align: 'center'
        },{
            sortName: 'player.ev',
            field: 'player.readableEV',
            title: 'EV',
            titleTooltip: 'Estimated Value',
            sortable: true,
            align: 'center'
        },{
            field: 'player.age',
            title: 'Age',
            sortable: true,
            align: 'center'
        },{
            field: 'player.workrate',
            title: 'Wr',
            sortable: true,
            align: 'center'
        },{
            field: 'player.experience',
            title: 'Xp',
            sortable: true,
            align: 'center'
        },{
            field: 'player.handling',
            title: 'Han',
            sortable: true,
            align: 'center'
        },{
            field: 'player.passing',
            title: 'Pas',
            sortable: true,
            align: 'center'
        },{
            field: 'player.rebounds',
            title: 'Rb',
            sortable: true,
            align: 'center'
        },{
            field: 'player.shooting',
            title: 'Sh',
            sortable: true,
            align: 'center'
        },{
            field: 'player.defense',
            title: 'Df',
            sortable: true,
            align: 'center'
        },{
            field: 'player.quickness',
            title: 'Qui',
            sortable: true,
            align: 'center'
        },{
            field: 'player.dribbling',
            title: 'Dri',
            sortable: true,
            align: 'center'
        },{
            field: 'player.positioning',
            title: 'Pos',
            sortable: true,
            align: 'center'
        },{
            field: 'player.freethrow',
            title: 'Ft',
            sortable: true,
            align: 'center'
        },{
            field: 'player.height',
            title: 'Cm',
            sortable: true,
            align: 'center'
        },{
            field: 'player.weight',
            title: 'Kg',
            sortable: true,
            align: 'center'
        },{
            field: 'player.character',
            title: 'Char',
            sortable: true,
            align: 'center'
        },
        // {
        //     sortName: 'player.wage',
        //     field: 'player.readableWage',
        //     title: 'Wg$',
        //     sortable: true,
        //     align: 'center'
        // },
        {
            field: 'player.country',
            title: 'Country',
            sortable: true,
            align: 'center'
        },{
            sortName: 'timestamps.expire',
            field: 'readableExpire',
            title: 'Transfer Ends',
            sortable: true,
            align: 'center',
            class: 'table-last-row'
        }
        ],
        data: transfers,
        classes: 'table blue-table table-striped table-market table-no-bordered',
        pagination: true,
        showHeader: true,
        sidePagination:'client'
    });
}

Template.TransferList.events({
    'click': function () {
        // ...
    }
});

Template.TransferList.helpers({
    foo: function () {
        // ...
    }
});
function dotify(x) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return parts.join(".");
}

/*Maybe I can use this to decode all names*/
function decodeHtml(html) {
    var txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}