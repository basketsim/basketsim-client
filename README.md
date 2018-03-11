# basketsim-client
Most of Basketsim code, except game engine and few backend services, that shall be released in a separate service. 

#Running
You need to have Node and Meteor(https://www.meteor.com/) installed. 
Once the project is cloned, run npm install to install dependencies and then "meteor" to run the project

#Getting around the code
The codebase is quite convulted due to trying to migrate away from Meteor standards, towards a more classical single page app.
Most of the functionality is written in "app_modules", with most recent additions in "vue_rest".
Any new code added should be written using Vue.js.
