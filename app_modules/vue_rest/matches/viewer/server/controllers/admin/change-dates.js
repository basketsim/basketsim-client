import moment from 'moment';
import Matches from './../../../../../../../collections/Matches';
import { isAdmin } from '../../../../../utils/server/utils';

function changeDates() {
  if (!isAdmin(this.userId)) throw new Meteor.Error(`${this.userId} does not have permission`);
  console.log('STARTED: changeDates');
  Matches.find({ "competition.season": 29, "competition.round":1}, {dateTime: 1}).forEach((match) => {
    let newTimestamp = moment(match.dateTime.timestamp).add(2, 'days').valueOf();
    let newDate = moment(newTimestamp).format('YYYY-MM-DD');
    let newTime = moment(newTimestamp).format('hh:mm');
    Matches.update({_id: match._id}, {$set: {
      dateTime: {
        timestamp: newTimestamp,
        date: newDate,
        time: newTime
      }
    }}, () => {});
  });
}

export { changeDates };