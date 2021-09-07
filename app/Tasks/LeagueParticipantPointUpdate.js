'use strict'

const Task = use('Task')
const Database = use('Database')

class LeagueParticipantPointUpdate extends Task {
    static get schedule() {
        return "*10 * * * * *"
    }

    async handle() {
        try {

            //Get All Started Leagues
            let StartedLeagues = await Database.from('leagues').where({ league_status: 'started' })
            StartedLeagues.forEach(async function(item) {
                //Get All League Participant
                let getLeagueParticipants = await Database.from('league_participants').where({ league_id: item.id }).andWhere('user_status', 1)
                    // console.log(getLeagueParticipants)
                getLeagueParticipants.forEach(async function(data) {
                    //Get Each League Participant points
                    let getLeagueParticipantPoint = await Database.from('squad_points').where({ squad_id: data.user_id }).whereBetween('week_season_id', [item.league_start_week, item.league_end_week])
                        // console.log(getLeagueParticipantPoint.squad_id, getLeagueParticipantPoint.week_season_id, getLeagueParticipantPoint.points_total)
                        //Sum up Each League Participant points
                    var sum = 0;
                    getLeagueParticipantPoint.forEach(async function(point) {
                        sum += point.points_total
                        console.log(point.squad_id, point.week_season_id, point.points_total, sum, item.id)
                        await Database
                            .table('league_participants')
                            .where('user_id', point.squad_id)
                            .andWhere('league_id', item.id)
                            .update('user_points', sum)
                    });
                });
            });
        } catch (error) {

        }
    }
}

module.exports = LeagueParticipantPointUpdate