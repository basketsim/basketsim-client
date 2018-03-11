import {Mongo} from 'meteor/mongo';

function general() {
    var api = {countries, trainSkills, allSkills, dotify, myID, myTeamID, list, objectID, totalSkill, findDuplicates};

    function countries() {
        return ["Greece", "Slovenia", "USA", "Italy", "Latvia", "Poland", "Spain", "Bosnia", "Serbia", "Estonia", "Lithuania", "France", "Turkey", "Croatia", "Philippines",
   "Romania", "Belgium", "Germany", "Israel", "Portugal", "Argentina", "Bulgaria", "Indonesia", "Finland", "FYR Macedonia", "United Kingdom", "Czech Republic",
   "Australia", "Uruguay", "Canada", "Hungary", "Switzerland", "Netherlands", "China", "Russia", "Slovakia", "Cyprus", "Brazil", "Chile", "Sweden", "Albania",
   "Venezuela", "Ukraine", "Montenegro", "Denmark", "Norway", "Ireland", "South Korea", "Malaysia", "Austria", "Malta", "Japan", "New Zealand", "Belarus", "Peru",
   "Thailand", "Mexico", "Colombia", "Hong Kong", "Puerto Rico", "Tunisia", "India", "Georgia", "Egypt"].sort();
    }

    function trainSkills() {
        return ['handling', 'quickness', 'passing', 'dribbling', 'rebounds', 'positioning', 'shooting', 'defense', 'freethrow'];
    }

    function allSkills() {
        return ['handling', 'quickness', 'passing', 'dribbling', 'rebounds', 'positioning', 'shooting', 'defense', 'experience', 'workrate', 'freethrow'];
    }

    function dotify(x) {
        var parts = x.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        return parts.join(".");
    }

    function myID() {
        return 'wg2H3Bem7BrERkEsZ';
    }

    function myTeamID() {
        return new Mongo.ObjectID('55cf113f1cc5f84ae63e4b00');
    }

    function list(length, generator, args) {
        var l = [];
        for (var i=0; i<length; i++) {
            l.push(generator.apply(this, args));
        }

        return l;
    }

    function objectID(str) {
        return new Mongo.ObjectID(str);
    }

    function totalSkill(player) {
        var skills = ['handling', 'quickness', 'passing', 'dribbling', 'rebounds', 'positioning', 'shooting', 'defense', 'experience', 'workrate', 'freethrow'];
        var sum = 0;
        _.each(skills, function(skill){
            player[skill] = Math.floor(player[skill]/8);
            if (skill !== 'workrate' && skill !== 'experience') sum = sum + player[skill];
        });

        console.log('ts sum', sum);
        return sum;
    }

    /**
     * Returns the duplicate elements from an array
     * @param arr {Array} Array of elements. Works with basic types.
     * @returns {Array} Returns the elements that were duplicated.
     */
    function findDuplicates(arr) {
        const duplicates = []
        const count = _.countBy(arr, (el) => {
            return el;
        });

        for (let el in count) {
            if (count[el] > 1) duplicates.push(el);
        }

        return duplicates;
    }

    return api;
}

export default general();