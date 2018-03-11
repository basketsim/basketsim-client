import { Accounts } from 'meteor/accounts-base';

Meteor.methods({
    'profile:admin:resetArenaName': resetArenaName,
    'profile:admin:resetTeamName': resetTeamName,
    'profile:admin:resetFanClubName': resetFanClubName,
    'profile:admin:resetLogo': resetLogo
});

function resetArenaName(teamID) {
    if (!sbutils.validations.isAdmin(this.userId)) return;

    var userinfo = UserInfo.findOne({team_id:teamID}, {fields: {username:1}});
    var arena = Arenas.findOne({team_id: teamID}, {fields:{_id:1, arenaname:1}});
    Arenas.update({team_id: teamID}, {
        $set: {arenaname: userinfo.username + "'s arena"},
        $push: {
            'history.name': {
                name: arena.arenaname,
                changedAt: new Date()
            }
        }
    });
}

function resetTeamName(teamID) {
    if (!sbutils.validations.isAdmin(this.userId)) return;

    var userinfo = UserInfo.findOne({team_id:teamID}, {fields: {username:1}});
    var team = Teams.findOne({_id: teamID}, {fields: {name:1}});

    Teams.update({_id: team._id}, {
        $set: {name: userinfo.username + "'s team"},
        $push: {
            'history.name': {
                name: team.name,
                changedAt: new Date()
            }
        }
    });
}

function resetFanClubName(teamID) {
    if (!sbutils.validations.isAdmin(this.userId)) return;

    var userinfo = UserInfo.findOne({team_id:teamID}, {fields: {username:1}});
    var arena = Arenas.findOne({team_id: teamID}, {fields:{_id:1, cheer_name:1}});

    Arenas.update({_id: arena._id}, {
        $set: {cheer_name: ""},
        $push: {
            'history.name': {
                name: arena.cheer_name,
                changedAt: new Date()
            }
        }
    });
}

function resetLogo(teamID) {
    if (!sbutils.validations.isAdmin(this.userId)) return;
    var chance = new Chance();
    var team = Teams.findOne({_id: teamID}, {fields: {name:1}});
    var logos = [
        "/resources/club-logo/basketball-bird.png",
        "/resources/club-logo/rhyno.png",
        "/resources/club-logo/shark.png",
        "/resources/club-logo/wild-dog.png",
        "/resources/club-logo/wild-dog-2.png"
    ];
    var logo = chance.pick(logos);

    Teams.update({_id: team._id}, {
        $set: {logo: logo},
        $push: {
            'history.logo': {
                logo: team.logo,
                changedAt: new Date()
            }
        }
    });
}