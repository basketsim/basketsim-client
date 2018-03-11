import utils from './utils.js'
import senior from './senior.js'
function coach() {
    var api = {create, bulkCreate, _getAge, _experience, _seniorAbility, _youthAbility, _wage, _price};
    var chance = new Chance();

    function create() {
        var pos = chance.pick(['PG', 'SG', 'SF', 'PF', 'C']);
        var country = utils.randomCountry();
        var p = {
            name: utils.name(country),
            surname: utils.surname(country),
            age: api._getAge(),
            createdAt: new Date().valueOf(),
            releasedAt: new Date().valueOf(),
            team_id: null,
            country: country,
            character: utils.character(),
            height: senior.height(pos),
            experience: api._experience(),
            seniorAbility: api._seniorAbility(),
            youthAbility: api._youthAbility(),
            coach: 1,
            type: 'coach',
            price: 0,
            motiv: 105,
            looks: utils.looks()
        };
        p.weight = utils.weight(p.height);
        p.wage = api._wage(p.experience, p.seniorAbility, p.youthAbility);
        p.price = api._price(p.experience, p.seniorAbility, p.youthAbility);
        p.fullName = p.name + ' ' + p.surname;

        return p;
    }

    function bulkCreate() {
        for (var i=0; i<50; i++) {
            Players.insert(api.create());
        }
    }

    function _getAge() {
        return Math.round(utils.normalMinMax(36, 58));
    }

    function _experience() {
        return Math.round(utils.normalMinMax(3, 16, 9, 2))*8;
    }

    function _seniorAbility() {
        return Math.round(utils.normalMinMax(10, 100, 68, 2.2));
    }

    function _youthAbility() {
        return Math.round(utils.normalMinMax(10, 100, 68, 2.2));
    }

    function _wage(experience, seniorAbility, youthAbility) {
        return Math.round(Math.pow(experience + seniorAbility + youthAbility, 2.06));
    }

    function _price(experience, seniorAbility, youthAbility) {
        return Math.round(Math.pow(experience + seniorAbility + youthAbility, 2.68));
    }

    return api;
}

export default coach();