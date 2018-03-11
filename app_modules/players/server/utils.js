function utils() {
    var api = {name, surname, character, looks, height, weight, wage, normalMinMax, randomRange, randomCountry, randomNumsToSum};

    var chance = new Chance();

    function name(country) {
        var names = Names.find({country:country}).fetch();
        return chance.pick(names).name;
    }
    function surname(country) {
        var surnames = Surnames.find({country:country}).fetch();
        return chance.pick(surnames).surname;
    }
    function character() {
        var characters = ['stable', 'entertaining', 'calm', 'aggresive', 'controversial', 'selfish', 'dirty', 'clumsy', 'explosive', 'loyal',
        'wise', 'fragile', 'tough', 'lazy'];
        var rand = Math.round(api.randomRange(0, characters.length-1));
        return characters[rand];
    }
    function looks() {
        return null;
        // return {
        //     face: 'template4_brown',
        //     ears: 'ears_brown1',
        //     mouth: 'mouth15',
        //     eyes: 'eyes6',
        //     nose: 'nose1',
        //     moustache: 'kumis1',
        //     hair: 'hair14'
        // }
    }
    function height(age) {
        var averageHeight= {
            '14': 181,
            '15': 187,
            '16': 191,
            '17': 196,
            '18': 196
        };
        var height;
        var spread;
        var random;
        if (Math.random()>0.5) {
            spread = -0.1;
        } else {
            spread = 0.1;
        }
        random = Math.random()* spread;

        if (age < 18) {
            height = averageHeight[age] + Math.round(averageHeight[age] * random);
        } else {
            height = averageHeight['18'] + Math.round(averageHeight['18'] * random);
        }
        return height;
    }

    function weight(height) {
        var bmi = Math.random()*13 + 18;
        bmi = parseFloat(bmi.toFixed(2));
        var weight = Math.pow(height/100,2) * bmi;
        weight = parseFloat(weight.toFixed(2))

        return weight;
    }

    function wage(player) {
        var skills = ['handling', 'quickness', 'passing', 'dribbling', 'rebounds', 'positioning', 'shooting', 'freethrow', 'defense', 'experience', 'workrate'];
        var skillSum = 0;
        var skillValue = 1;
        var expDiff = 0;
        var starBonus = 1;
        _.each(skills, function(skill){
            skillValue = parseFloat(player[skill]) || 0;
            if (skill === 'experience') {
                if (skillValue > 160) {
                    expDiff = skillValue - 160;
                    skillValue = 160 + expDiff/2.2;
                }
                skillValue = skillValue * 1.5;
            }
            if (skill === 'workrate') skillValue = skillValue * 1.7;
            if (skill === 'defense') skillValue = skillValue * 1.4;


            skillSum = skillSum + skillValue;
        });

        starBonus = Math.pow(1.32, Math.sqrt(skillSum/8));
        skillSum = skillSum + Math.round(starBonus)*10;

        var wage = Math.pow(skillSum/8, 2.22);
        return Math.round(wage);
    }

    function randomCountry() {
        var listOfCountries = ["Greece", "Slovenia", "USA", "Italy", "Latvia", "Poland", "Spain", "Bosnia", "Serbia", "Estonia", "Lithuania", "France", "Turkey", "Croatia", "Philippines",
       "Romania", "Belgium", "Germany", "Israel", "Portugal", "Argentina", "Bulgaria", "Indonesia", "Finland", "FYR Macedonia", "United Kingdom", "Czech Republic",
       "Australia", "Uruguay", "Canada", "Hungary", "Switzerland", "Netherlands", "China", "Russia", "Slovakia", "Cyprus", "Brazil", "Chile", "Sweden", "Albania",
       "Venezuela", "Ukraine", "Montenegro", "Denmark", "Norway", "Ireland", "South Korea", "Malaysia", "Austria", "Malta", "Japan", "New Zealand", "Belarus", "Peru",
       "Thailand", "Mexico", "Colombia", "Hong Kong", "Puerto Rico", "Tunisia", "India", "Georgia", "Egypt"];


        return chance.pick(listOfCountries);
    }

    function randomNumsToSum(length, sum) {
        var nums = [];
        var randSum = 0;
        for (var i=0; i<length; i++) {
            nums.push(twoDecs(Math.random()));
        }

        randSum = _.reduce(nums, function(tmpSum, num){return tmpSum+num}, 0);
        nums = _.map(nums, function(num){return twoDecs(num* sum/randSum)});
        return nums;
    }

    function twoDecs(num) {
        return Math.round(num*100)/100;
    }

    function normalMinMax(min,max, avg, focusRatio) {
        var mean, dev, normalVal;

        if (avg) {
            mean = avg;
        } else {
            mean = (min + max) / 2;
        }

        if (focusRatio) {
            dev = (max - mean) / focusRatio;
        } else {
            dev = (max - mean) / 3.2;
        }

        normalVal = chance.normal({mean:mean, dev:dev});

        if (normalVal > max) normalVal = max;
        if (normalVal < min) normalVal = min;
        return normalVal;
    }

    function randomRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    return api;
}

export default utils();