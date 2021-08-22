'use strict'

const Task = use('Task')
const Database = use('Database')

class LeagueParticipantRanking extends Task {
    static get schedule() {
        return "*/1 * * * * *"
    }

    async handle() {
        try {
            //Get All Started Leagues
            let StartedLeagues = await Database.from('leagues').where({ league_status: 'started' })
            StartedLeagues.forEach(async function(item) {
                //Get All League Participant
                let getLeagueParticipants = await Database.from('league_participants').where({ league_id: item.id }).andWhere('user_status', 1).orderBy('user_ponts', 'DESC')
                for (let index = 0; index < getLeagueParticipants.length; index++) {
                    let element = getLeagueParticipants[index];
                    //Rank League Participants
                    await Database
                        .table('league_participants')
                        .where('user_id', element.user_id)
                        .andWhere('league_id', element.league_id)
                        .update('user_ranking', index + 1)
                }
            });
        } catch (error) {
            console.log(error)
        }
    }
}

module.exports = LeagueParticipantRanking