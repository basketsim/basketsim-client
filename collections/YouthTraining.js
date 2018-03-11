/*Current Training YOUTH*/
/**
 * motiv - remaining weeks
 * price - skill trained - 1-9: handling, quickness, passing, dribbling, rebounds, positioning, shooting, freethrows, defense
 *
 * One option is to create a new collection with youth training that has:
 * player_id (index)
 * skill
 * length
 * remaining
 * result
 * the skill is trained as soon as the training is commited. when remaining === 0, the result is just shown and added to the player.
 * Prevent multiple trainings by looking in the table of youth training for existing training
 */
global.YouthTraining = new Mongo.Collection('youth-training', {idGeneration: 'MONGO'});