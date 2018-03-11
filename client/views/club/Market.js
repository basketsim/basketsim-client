var sliders = [ {name:'Age', className:'age', min: 14, max: 60, step:1},
                {name:'Height', className:'height', min: 0, max: 300, step:5},
                {name:'Weight', className:'weight', min: 0, max: 200, step: 5},
                {name:'Wage', className:'wage', min: 0, max: 400000, step:15000},
                {name:'Price', className:'price', min: 0, max: 90000000, step: 200000},
                {name:'Skill 1', className:'skill1', min: 0, max: 20, step: 1},
                {name:'Skill 2', className:'skill2', min: 0, max: 20, step: 1},
                {name:'Skill 3', className:'skill3', min: 0, max: 20, step: 1},
                {name:'Skill 4', className:'skill4', min: 0, max: 20, step: 1},
                {name:'Skill 5', className:'skill5', min: 0, max: 20, step: 1}
                ];
var skills= ['Handling', 'Quickness', 'Passing', 'Dribbling', 'Rebounds', 'Positioning',
            'Shooting', 'Freethrows', 'Defense', 'Workrate', 'Experience'];

var listOfCountries = ["Greece", "Slovenia", "USA", "Italy", "Latvia", "Poland", "Spain", "Bosnia", "Serbia", "Estonia", "Lithuania", "France", "Turkey", "Croatia", "Philippines",
   "Romania", "Belgium", "Germany", "Israel", "Portugal", "Argentina", "Bulgaria", "Indonesia", "Finland", "FYR Macedonia", "United Kingdom", "Czech Republic",
   "Australia", "Uruguay", "Canada", "Hungary", "Switzerland", "Netherlands", "China", "Russia", "Slovakia", "Cyprus", "Brazil", "Chile", "Sweden", "Albania",
   "Venezuela", "Ukraine", "Montenegro", "Denmark", "Norway", "Ireland", "South Korea", "Malaysia", "Austria", "Malta", "Japan", "New Zealand", "Belarus", "Peru",
   "Thailand", "Mexico", "Colombia", "Hong Kong", "Puerto Rico", "Tunisia", "India", "Georgia", "Egypt"];

var currentFilter;

var filter = {
    position: {
        val: [],
        changed: false,
    },
    character: {
        val: [],
        changed: false,
    },
    country: {
        val: [],
        changed: false,
    },
    skill: [{key: 'Skill 1'}, {key: 'Skill 2'}, {key: 'Skill 3'}, {key: 'Skill 4'}, {key: 'Skill 5'}],
    age: {
        min: 0,
        max: 0,
        changed: false,
    }
};

Template.Market.events({
    'keyup .sel': saveSelection,
    'click .sel': toggleActive,
    'click .scrollable': clickAnyElement,
    'click .dropdown-menu li a': selectFilter,
    'click .market-search': searchPlayers,
    'click .dropdown-toggle.market-button': setCurrentFilter
});

function saveSelection(evt) {
    if (String.fromCharCode(evt.which) === 's' || String.fromCharCode(evt.which) === 'S') {
        _.each($(evt.currentTarget.parentElement.children), function(el){
            if (!$(el).hasClass('active')) {
                $(el).hide();
            }
        });
    }
}

function toggleActive(evt) {
    $(evt.currentTarget).toggleClass('active');
}

/**
 * Remove active selection from first element when any other is clicked
 * If first is clicked, look for all others and remove active selection. Readd active on first
 */
function clickAnyElement(evt) {
    if ($(evt.originalEvent.target).text().indexOf('Any')!==0) {
        $(evt.currentTarget).find('.not-first').removeClass('active');
    } else {
        _.each($(evt.currentTarget).find('.sel'), function(el){
            $(el).removeClass('active');
        });
        $(evt.currentTarget).find('.not-first').addClass('active');
    }
}

function selectFilter(evt) {
    $(evt.currentTarget).parent().parent().parent().find('button .name').text(this.toString());
    var values= {};
    var self=this;
    var existing = false;
    var key;

    //The skill sliders are the small skills displayed at the bottom of the sliders
    _.each($('.skills-sliders .min-value, .max-value'), function(el){
        if ($(el).data('key') === currentFilter) {
            $(el).text($(el).data('minmax')+ self.toString());

            //get values
            if ($(el).data('minmax') === 'Min ') {
            }
        }
    });

    _.each($('.skills-sliders input.market-input-left, input.market-input-right'), function(el){
        if ($(el).data('key') === currentFilter) {
            if ($(el).hasClass('market-input-left')) {
                values.min = $(el).val();
            } else {
                values.max = $(el).val();
            }
        }
    });

    //assign object
    for (var i=0; i< filter.skill.length; i++) {
        if (filter.skill[i].key === currentFilter) {
            key = filter.skill[i].key;
            filter.skill[i] = {
                name: self.toString(),
                min: values.min,
                max: values.max,
                changed: true,
                key: key
            };
        }
    }
}

function setCurrentFilter(evt) {
    currentFilter = $(evt.currentTarget).data('name');
}

function searchPlayers(evt) {
    evt.preventDefault();
    var searchFilter = {};
    searchFilter = collectStaticFilters(searchFilter);
    searchFilter = collectDynamicFilters(searchFilter);
    searchFilter = collectMultiSelect(searchFilter);

    console.log('searchFilter', searchFilter);
    Session.set('searchFilter', searchFilter);
    Router.go('market/players');
}

function collectDynamicFilters(searchFilter) {
    _.each($('.market-button'), function(buttonEl){
        searchFilter[$(buttonEl).children('.name').text().toLowerCase()] = {};
        _.each($('.filter-val input.market-input-left'), function(el){
            if ($(buttonEl).data('name') === $(el).data('key')) {
                searchFilter[$(buttonEl).children('.name').text().toLowerCase()].min = parseInt($(el).val());
            }
        });
        _.each($('.filter-val input.market-input-right'), function(el){
            if ($(buttonEl).data('name') === $(el).data('key')) {
                searchFilter[$(buttonEl).children('.name').text().toLowerCase()].max = parseInt($(el).val());
            }
        });
    });

    return searchFilter;
}

function collectStaticFilters(searchFilter) {
    _.each($('.simple-filter'), function(buttonEl){
        searchFilter[$(buttonEl).text().toLowerCase()] = {};
        _.each($('.filter-val input.market-input-left'), function(el){
            if ($(buttonEl).data('name') === $(el).data('key')) {
                searchFilter[$(buttonEl).text().toLowerCase()].min = parseInt($(el).val());
            }
        });
        _.each($('.filter-val input.market-input-right'), function(el){
            if ($(buttonEl).data('name') === $(el).data('key')) {
                searchFilter[$(buttonEl).text().toLowerCase()].max = parseInt($(el).val());
            }
        });
    });

    return searchFilter;
}

function collectMultiSelect(searchFilter) {
    var multiselect = ['position', 'character', 'country'];
    _.each(multiselect, function(multi){
        searchFilter[multi] = [];
        _.each($('.scrollable'+'.'+multi+' .active'), function(multiSel){
            searchFilter[multi].push($(multiSel).data('multivalue'));
        });

    });

    return searchFilter;
}

Template.Market.helpers({
    filters: function(type) {
        var filters = [];

        switch(type) {
            case 'all':
                filters = sliders;
            break;
            case 'nonskill':
                _.each(sliders, function(flt){
                    if (flt.name.indexOf('Skill') !== 0) {
                        filters.push(flt);
                    }
                });
            break;
            case 'skill':
                _.each(sliders, function(flt){
                    if (flt.name.indexOf('Skill') === 0) {
                        filters.push(flt);
                    }
                });
            break;
            default:
                filters =  sliders;
        }

        return filters;
    },

    getSkills: function() {
        return skills;
    },

    countryList: function() {
        return listOfCountries.sort();
    }
});

Template.Market.onRendered(function(){
    _.each(sliders, function(el){
        $('.'+el.className).noUiSlider({
            start: [el.min, el.max],
            connect: true,
            format: wNumb({
                decimals: 0
            }),
            range: {
                'min': el.min,
                'max': el.max
            },
            step: el.step
        });
        $('.'+el.className).Link('lower').to($('.min-'+el.className));
        $('.'+el.className).Link('upper').to($('.max-'+el.className));

        $('.'+el.className).on('set', function(evt){
            console.log($('.'+el.className).val(), el.className); //this gets the value
        });
    });
});

function slugify(txt) {
    var slug = '';
    slug = txt.toLowerCase();
    slug = slug.replace(/ /g, '');
    return slug;
}