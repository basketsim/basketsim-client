import Players from './../../../../collections/Players';
const playersModel = {
    fetchSkills
};

function fetchSkills(query) {
    return Players.find(query, {fields:{
      age: 1,
      handling: 1,
      passing: 1,
      rebounds: 1,
      freethrow: 1,
      shooting: 1,
      defense: 1,
      workrate: 1,
      experience: 1,
      wage: 1,
      coach: 1,
      ntplayer: 1,
      dribbling: 1,
      positioning: 1,
      quickness: 1,
      character: 1,
      ev: 1,
    }});
}

export default playersModel;