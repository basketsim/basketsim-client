import { Meteor } from 'meteor/meteor';

function callPromise(method, query) {
  return new Promise((resolve, reject) => {
    Meteor.call(method, query, (error, result) => {
      if (error) reject(error);
      resolve(result);
    });
  });
}

export { callPromise };