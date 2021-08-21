'use strict'

const Task = use('Task')
const Database = use('Database')
const WeekSeason = use("App/Models/WeekSeason");

class LeagueStatus extends Task {
    static get schedule() {
        return "*/1 * * * * *"
    }

    async handle() {
        try {
            let date = new Date()

            //Start League
            let LeaguesStarted = await Database.from('leagues').where({ league_status: 'not started' })
            LeaguesStarted.forEach(async function(item) {
                let getWeek = await WeekSeason.find(item.league_start_week)
                if (getWeek) {
                    if (getWeek.week_start_date >= date) {
                        await Database
                            .table('leagues')
                            .where('id', item.id)
                            .update('league_status', 'started')
                    }
                }
            });


            //End League
            let LeaguesEnded = await Database.from('leagues').where({ league_status: 'started' })
            LeaguesEnded.forEach(async function(item) {
                let getWeek = await WeekSeason.find(item.league_end_week)
                if (getWeek) {
                    if (getWeek.week_end_date >= date) {
                        await Database
                            .table('leagues')
                            .where('id', item.id)
                            .update('league_status', 'ended')
                    }
                }
            });
        } catch (error) {
            console.log(error)
        }
    }
}

module.exports = LeagueStatus