function coach() {
    var api = {wagePriceAvg};

    function wagePriceAvg() {
        var coaches = Players.find({coach:1}).fetch();
        var props = ['seniorAbility', 'youthAbility', 'experience', 'wage', 'price'];
        var sum = {
            seniorAbility: 0,
            youthAbility: 0,
            experience: 0,
            wage: 0,
            price: 0
        };

        _.each(coaches, function(coach){
            sum.seniorAbility += coach.seniorAbility;
            sum.youthAbility += coach.youthAbility;
            sum.experience += parseFloat(coach.experience);
            sum.wage += coach.wage;
            sum.price += coach.price;
        });

        _.each(props, function(prop){
            sum[prop] = sum[prop]/coaches.length;
        });
        return {
            wagePerSkill: _twoDecs(sum.wage / ((sum.seniorAbility+sum.youthAbility+sum.experience)/3)),
            pricePerSkill: _twoDecs(sum.price / ((sum.seniorAbility+sum.youthAbility+sum.experience)/3)),
            wagePerSA: _twoDecs(sum.wage/sum.seniorAbility),
            wagePerYA: _twoDecs(sum.wage/sum.youthAbility),
            wagePerExp: _twoDecs(sum.wage/sum.experience),
            pricePerSA: _twoDecs(sum.price/sum.seniorAbility),
            pricePerYA: _twoDecs(sum.price/sum.youthAbility),
            pricePerExp: _twoDecs(sum.price/sum.experience)
        }
    }

    function _twoDecs(num) {
        return Math.round(num*100)/100;
    }

    return api;
}

export default coach();
