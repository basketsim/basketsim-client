class MedicalCenterModel {
    reset(teamID) {
        var mc = this.create(teamID);
        MedicalCenter.update({team_id: teamID}, mc);
    }

    insert(teamID) {
        var mc = this.create(teamID);
        MedicalCenter.insert(mc);
    }

    create(teamID) {
        var mc = {
            createdAt: new Date(),
            team_id: teamID,
            current_level: 0,
            next_update: null
        }

        return mc;
    }
}

export default new MedicalCenterModel();

