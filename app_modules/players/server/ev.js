import teamModel from './../../teams/server/models/team-datamodel.js';
import Players from './../../../collections/Players';
import mongojs from 'mongojs';

function ev() {
    var api = {update, updateOne, getEV};


    function update() {
        console.log('STARTED: Update EV');
        const activeTeams = teamModel.getActive({_id:1});
        const activeIDs = activeTeams.map(function(team){ return team._id; });
        const playersBulk = Players.rawCollection().initializeUnorderedBulkOp();
        const players = Players.find({coach:0, team_id: {$in: activeIDs}});
        const length = players.count();


        players.forEach(function (p, i) {
            let ev = getEV(p);
            playersBulk.find({_id: mongojs.ObjectId(p._id._str)}).updateOne({ $set: { ev:ev }});
            if (i%1000 === 0) console.log(`PROGRESS: Updated Players EV ${i}/${length}`);
        });

        console.log(`EXECUTE: ${length} to Updated Players EV`);
        playersBulk.execute(function (err) {
            if (err) {
                console.log('ERROR: Update EV');
                console.log(err);
            } else {
                console.log('ENDED: Update EV');
            }
        });
    }

    function updateOne(playerID) {
        const player = Players.findOne({_id: playerID});
        const ev = getEV(player);
        Players.update({_id: playerID}, {$set: {ev:ev}});
    }

    function getEV(p) {
        var skills = ['height', 'handling', 'passing', 'rebounds', 'positioning', 'freethrow', 'shooting', 'defense', 'quickness', 'dribbling', 'experience', 'age', 'workrate'];
        skills.forEach(function (skill) {
            p[skill] = parseFloat(p[skill]);
        });
        var val = (p.height * 2) + p.handling + (p.quickness * 4) + (p.passing * 2) + (p.dribbling * 2) + (p.rebounds * 3) + (p.positioning * 4) + (p.freethrow * 3) + (p.shooting * 4) + (p.experience * 2) + (p.defense * 3);
        val = ((val * val * val) / 225000) - 7500;
        if (val < 200) {val=200;}

        var ev =(((val/9)*(val/9))/15)*((val/240000+(1/(Math.exp(Math.pow(((p.age-16)/10),4.1)))))*((((p.workrate/8)+1)/19)+1))*((Math.sqrt(val/180000))/((((Math.tanh(((p.age/2)-10))/2)+0.5)*0.71)+0.29));
        // ev = ev* 0.85;
        if (ev < 1000) {ev=1000;}

        if (isNaN(ev)) console.log('ev is nan:', p);
        ev = Math.round(ev);
        ev = Math.round(ev/1000) * 1000;

        return ev;
    }

    return api;
}

export default ev();