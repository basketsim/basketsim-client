/**
 * A very good player would have total skill of around 130
 * Very good senior development stands at 60-70 -> 480 - 560 training points
 * Therefore, training is influence by:
 * Age
 * Workrate
 *
 * Coach skill
 * Training intensity
 * Total skill sum (the higher the player in skills, harder it is for him to train)
 * Skill trained versus average - If the player has a skill hadicap compared to the average, trains that skill slightly easire
 *                              - If player is training skills above his average, trains them a bit harder
 *
 * Split the 10 training points in intervals to which different areas contribute. Ex: 0-2.5 age, 0-4 wr, 0-2.8 skill bonus, 0-0.7 skillBase
 * Intensity and coach are multipliers
 */
function senior() {
    var api = {train};

    function train(player, skill, intensity, coach) {
        if (!player) return 0; //when teams have lost by walkover
        var workrateInf = getWorkrateInfluence(player, 0, 4);
        var ageInf = getAgeInfluence(player, 0, 2.7) //age between 17 and 33 - 16 levels
        var skillBonus = totalSkillBonus(player, 0, 2.5);
        var balanceBonus = getBalanceBonus(player, parseFloat(player[skill]), 0, 0.8);

        var trainingSum = (workrateInf + ageInf + skillBonus + balanceBonus) * 0.75;
        if (trainingSum < 0) trainingSum = 0;

        trainingSum = trainingSum * randomRange(0.95, 1.05);
        trainingSum = trainingSum * coachInfluence(coach);
        trainingSum = trainingSum * getIntensity(intensity);
        // console.log(skill, ' would have trainied ', twoDecs(trainingSum), 'season total: ', twoDecs(trainingSum)*14);

        return twoDecs(trainingSum);
    }

    /**
     */
    function getWorkrateInfluence(player, scaleMin, scaleMax) {
        var min = 0;
        var max = 20;

        var inf = player.workrate/8;

        if (inf< min) inf = min;
        if (inf > max) inf = max;

        var scaledInf = scaleIt(min, max, scaleMin, scaleMax, inf);

        // console.log('workrate influence:', scaledInf);
        return scaledInf;

    }

    /**
     * Min: 0
     * Max: 8.31
     * @param  {[type]} scaleMin [description]
     * @param  {[type]} scaleMax [description]
     * @return {[type]}          [description]
     */
    function getAgeInfluence(player, scaleMin, scaleMax) {
        var maxAge = 36;
        var minAge = 16;
        var threshold = 26;

        var diff = threshold - player.age;
        var sign = 1;

        if (diff < 0) sign = -1;
        diff = diff * sign;

        if (diff > 10) diff = 10;

        var value = Math.pow(1.25, diff) - 1;
        value = scaleIt(0, 8.31, scaleMin, scaleMax, value);
        value = twoDecs(value*sign);

        // console.log('age influence:', value);
        return value;
    }

    function twoDecs(num) {
        return Math.round(num*100)/100;
    }

    /**
     * Training bonus based on skill
     * Min: 0
     * Max: 48.61 (for 45+ skills difference)
     */
    function totalSkillBonus(player, scaleMin, scaleMax) {
        var threshold = 100;
        var skillSum = getSkillSum(player)/8;
        // console.log('skillSum, threshold', skillSum, threshold);
        var diff = threshold - skillSum;
        var sign = 1;

        if (diff < 0) sign = -1;
        diff = diff * sign;
        // console.log('diff should be 39, diff:', diff);

        if (diff > 45) diff = 45;

        var power = diff/3.2;
        var value = Math.pow(1.32, power) - 1;
        // console.log('totalSkillBonus', value);
        value = scaleIt(0, 48.61, scaleMin, scaleMax, value);
        value = twoDecs(value*sign);

        // console.log('total skill influence:', value);
        return value;
    }

    /**
     * Ex: Player skill avearage is 80. Rebound skill is 0. Rebs train faster
     * Min: 0
     * Max: 47.75 (for 56+ skills difference) meaning average is smaller or bigger with 7 skill levels
     */
    function getBalanceBonus(player, skillValue, scaleMin, scaleMax) {
        var average = skillAverage(player);

        var diff = average - skillValue;
        var sign = 1;

        if (diff < 0) sign = -1;
        diff = diff * sign;

        if (diff > 56) diff = 56;

        var power = diff/4;
        var value = Math.pow(1.32, power);

        value = scaleIt(0, 47.75, scaleMin, scaleMax, value);
        value = twoDecs(value*sign);

        // console.log('balance skill influence:', value);
        return value;

    }

    function getSkillSum(player) {
        var skillSum = 0;
        var skills = ['handling', 'quickness', 'passing', 'dribbling', 'rebounds', 'positioning', 'shooting', 'freethrow', 'defense'];
        _.each(skills, function(skill){
            skillSum = skillSum + parseFloat(player[skill]) || 0;
        });
        return skillSum;
    }

    function skillAverage(player) {
        return twoDecs(getSkillSum(player)/9);
    }

    /**
     * Scales a value based on the 0-scaleMax interval
     * @param  {[type]} min      min value to be scaled
     * @param  {[type]} max      max value to be scaled
     * @param  {[type]} scaleMax upper limit of the scaling interval
     * @param  {[type]} value    the value to be scaled. If smaller or greater than min/max, those will be used instead
     * @return {[type]}          Returns a value that is between 0 scaleMax
     */
    function scaleIt(originalMin, originalMax, scaleMin, scaleMax, value) {
        var originalInterval = originalMax - originalMin;
        var scaleInterval = scaleMax - scaleMin;

        var ratio = scaleInterval/originalInterval;

        if (value < originalMin) value = originalMin;
        if (value > originalMax) value = originalMax;

        var result = value*ratio;


        return twoDecs(result);
    }

    /**
     * Input ability is expected to be on 0-100 scale
     * Returned coach influence is used as a multiplier of the training sum
     * Min: 0.75
     * Max: 1.25
     */
    function coachInfluence(coach) {
        var ability = 0;
        if (coach) {ability = coachAbility(coach)};


        var inf = xOnRange(ability, 0,100, 0.75, 1.25);
        return twoDecs(inf);
    }

    function xOnRange(x, xMin, xMax, yMin, yMax) {
        return x * ((yMax-yMin)/(xMax-xMin)) + yMin;
    }

    /*
        Ability on 0 - 100 scale
     */
    function coachAbility(coach) {
        var ability = 1;
        var motivativation = coach.motiv;
        var ratio = 1;
        if (motivativation > 100) motivativation = 100;
        ratio = motivativation/100;

        ability = Math.round(coach.seniorAbility * ratio);
        return ability;
    }

    function getIntensity(intensity) {
        var intensities = {
            leisure: 0.55,
            normal: 0.85,
            intense: 1.05,
            immense: 1.20
        };
        var val = intensities[intensity];
        return val;
    }

    function randomRange(min, max) {
        return twoDecs(Math.random() * (max - min) + min);
    }

    return api;
}

export default senior();

