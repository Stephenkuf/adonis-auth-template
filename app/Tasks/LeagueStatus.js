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
                    let third = totalPrice * 0.2
                    let position = [first, second, third]

                    //Top Three
                    if (item.league_winner_type == 'default') {
                        /* this is an example for new snippet extension make by me xD */
                        for (let index = 0; index < LeaguesParticipants.length; index++) {
                            console.log(LeaguesParticipants[index].user_id, position[index])
                            let userBalance = await Database.from('wallets').where({ user_id: LeaguesParticipants[index].user_id }).first()
                            await Database
                                .table('wallets')
                                .where('user_id', LeaguesParticipants[index].user_id)
                                .update('balance', userBalance.wallet + position[index])
                        }
                    }

                    //Winner takes all
                    if (item.league_winner_type == 'winner') {
                        let userBalance = await Database.from('wallets').where({ user_id: LeaguesParticipants[index].user_id }).first()
                        await Database
                            .table('wallets')
                            .where('user_id', LeaguesParticipants[0].user_id)
                            .update('balance', userBalance.balance + totalPrice)
                    }


                }
            });
        } catch (error) {
            console.log(error)
        }
    }
}

module.exports = LeagueStatus