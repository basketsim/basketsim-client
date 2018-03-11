/*
id,
match,
rating: no of stars based on value and form,
details: {
	passes,
	2p: {
		attempts:
		converted:
	},
	3p: {
		attempts:
		converted:
	}
	ft: {
		attempts:
		converted:
	}
	rb: {
		defensive:
		offensive:
	},
	assists:,
	fouls:,
	turn overs,
	blocks,
	overallRating:
}
 */
global.PlayerStatistics = new Mongo.Collection('playerStatistics');