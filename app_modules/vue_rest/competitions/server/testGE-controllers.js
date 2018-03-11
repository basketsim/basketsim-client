import { HTTP } from 'meteor/http';
import { Meteor } from 'meteor/meteor';
import {isAdmin} from "../../utils/server/utils";
import Matches from "../../../../collections/Matches";

function simTestMatches() {
  if (!isAdmin(this.userId)) return;
  const matches = Matches.find({'competition.collection': 'TestGE', 'state.simulated': false}, {fields: {_id: 1}}).fetch();

  simMatch(matches, 0);


  function simMatch(matches, index) {
    if (index === matches.length) return;

    let match = matches[index];
    HTTP.call('GET', `http://localhost:8000/sim/${match._id}`, (err, res) => {
      if (!err) {
        console.log(`simulated ${index+1} / ${matches.length} matches`);
        simMatch(matches, index+ 1);
      } else {
        throw new Meteor.Error(err);
      }
    });
  }

  console.log('not blocking');

}

export { simTestMatches };