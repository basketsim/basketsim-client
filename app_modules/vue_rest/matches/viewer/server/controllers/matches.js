import Matches from './../../../../../../collections/Matches';
import { Meteor } from 'meteor/meteor';
function getMatches(query) {
  //Find and fields will contain validation rules
  const find = sanitizeFind(query.find);
  const fields = sanitizeFields(query.fields);
  return Matches.find(find, {fields: fields}).fetch();
}

function sanitizeFind(find) {
  const params = {
    _id: (val) => {
      if (val.length > 32) throw new Meteor.error(`GET:matches invalid id: ${val}`);
      return val;
    }
  };
  const sFind = {};

  for (let param in params) {
    if (find[param]) {
      sFind[param] = params[param](find[param]);
    }
  }

  return sFind;
}

function sanitizeFields(fields) {
  const params = {
    endDate: fieldVal,
    dateTime: fieldVal,
    ['homeTeam.defensive']: fieldVal,
    ['homeTeam.offensive']: fieldVal,
    ['awayTeam.defensive']: fieldVal,
    ['awayTeam.offensive']: fieldVal
  };

  const sField = {};

  for (let param in params) {
    if (fields[param]) {
      sField[param] = params[param](fields[param]);
    }
  }

  return sField;
}

function fieldVal(val) {
  if (val !== 0 && val !== 1) throw new Meteor.error(`GET:matches invalid field value: ${val}`);
  return val;
}

export { getMatches };