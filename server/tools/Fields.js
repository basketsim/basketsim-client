global.Fields = {
    userinfo: {
        restricted: {
            national_team: true,
            supporter_days: true,
            team_id: true,
            username: true,
            achievements: true
        },
        own: {
        }
    },
    players: {
        restricted: {
            age: true,
            character: true,
            coach: true,
            country: true,
            fatigue: true,
            height: true,
            ntplayer: true,
            price: true,
            shirt: true,
            statement: true,
            surname: true,
            team_id: true,
            wage: true,
            weight: true,
            name: true,
            transfer_id: true,
            ev: true,
            stats:true
        }
    },
    matches: {
        restricted: {
            'awayTeam.defensive': false,
            'awayTeam.offensive': false,
            'awayTeam.startingFive': false,
            'awayTeam.subs': false,
            'awayTeam.matchRatings':false,
            'homeTeam.defensive': false,
            'homeTeam.offensive': false,
            'homeTeam.startingFive': false,
            'homeTeam.subs': false,
            'homeTeam.matchRatings':false,
            'matchHistory': false
        },
        history: {
            'awayTeam.defensive': false,
            'awayTeam.offensive': false,
            'awayTeam.startingFive': false,
            'awayTeam.subs': false,
            'homeTeam.defensive': false,
            'homeTeam.offensive': false,
            'homeTeam.startingFive': false,
            'homeTeam.subs': false,
        }
    },
    teams: {
        restricted: {
            name: true,
            country: true,
            shirt: true,
            logo: true,
            conwins: true,
            competitions: true,
            stats: true
        }
    },
    coaches: {
        market: {
            name: true,
            surname: true,
            seniorAbility: true,
            youthAbility: true,
            character: true,
            experience: true,
            motiv: true,
            wage: true,
            age: true,
            country: true
        }
    }
};