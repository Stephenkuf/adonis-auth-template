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

            //End League
            let CheckLeaguesEnded = await Database.from('leagues').where({ league_status: 'ended' })
            CheckLeaguesEnded.forEach(async function(item) {
                if (item.league_status == 'ended') {
                    let LeaguesTotalPrice = await Database.from('league_participants').where({ league_id: item.id }).andWhere('user_status', 1).getCount()
                    let LeaguesParticipants = await Database.from('league_participants').where({ league_id: item.id }).andWhere('user_status', 1).orderBy('user_ponts', 'DESC').limit(3)
                    let totalPrice = LeaguesTotalPrice * item.amount

                    let first = totalPrice * 0.5
                    let second = totalPrice * 0.3
                    let thrd = totalPrice * 0.2

                    console.log(LeaguesParticipants[0].user_id, totalPrice, first, second, thrd)
                    if (item.league_winner_type == 'winner') {
                        let user = await Database.from('users').where({ id: LeaguesParticipants[0].user_id }).first()
                        await Database
                            .table('users')
                            .where('id', LeaguesParticipants[0].user_id)
                            .update('wallet', user.wallet + totalPrice)
                    }

                    // if (item.league_winner_type == 'default') {
                    //     LeaguesParticipants.forEach(async function(userData) {
                    //         let user = await Database.from('users').where({ id: userData.user_id })
                    //         await Database
                    //             .table('users')
                    //             .where('id', userData.user_id)
                    //             .update('wallet', user.wallet + totalPrice)
                    //     });
                    // }

                }
            });
        } catch (error) {
            console.log(error)
        }
    }
}

module.exports = LeagueStatus