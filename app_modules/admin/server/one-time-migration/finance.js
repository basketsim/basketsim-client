import finances from './../../../finances/server/api.js'
function finance() {
    var api = {calculateTempMoney};

    function calculateTempMoney() {
        if (this.userId !== 'wg2H3Bem7BrERkEsZ') return;
        var teams = Teams.getActive();
        _.each(teams, function(team, i){
            finances.spending.update(team._id);
            console.log('finance update', i+1, '/', teams.length);
        });
    }

    return api;
}

export default finance();