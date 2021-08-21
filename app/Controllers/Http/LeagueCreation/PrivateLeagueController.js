'use strict'

const LeagueParticipantSchema = use("App/Models/LeagueParticipant");
const League = use("App/Models/League");
const User = use("App/Models/User");
const SystemSettings = use('App/Models/SystemSetting')
const Database = use('Database')

class PrivateLeagueController {

    //Join Private League
    async joinLeague({ request, response, auth }) {
        //Auth User
        const user = auth.current.user

        //Get User Wallet
        const userWallet = await Database.from('wallets').where({ user_id: user.id })

        //User Wallet Handling    
        async function deductMoney(amount) {
            try {
                userWallet.balance = userWallet.balance - amount
                userWallet.save()
                return true
            } catch (error) {
                return false
            }
        }

        try {
            //Get League Invite Code
            let { league_code, league_id } = request.all()

            //Check League with league code
            const checkLeague = await League.query().where("id", league_id).andWhere("league_invite_code", league_code).first()

            if (!checkLeague) {
                return response.status(404).json({
                    status: "League not found",
                    status_code: 404,
                    message: `The League with Invite Code ${league_code} not found`
                })
            }

            //Check if league has started or ended
            if (checkLeague.league_status == "started" || checkLeague.league_status == "ended") {
                return response.status(400).json({
                    status: "League has already started or ended",
                    status_code: 400,
                    message: `The League ${checkLeague.league_name} has already started or ended`
                })
            }

            //Check if is paid league            
            if (checkLeague.league_paid == 'Yes') {
                //Check if user have enough balance in wallet
                if (checkLeague.amount > userWallet.balance) {
                    return response.status(400).json({
                        status: "no sufficient fund",
                        status_code: 400,
                        message: "The user wallet is not sufficient for the league amount"
                    })
                }

                //deduct league fee from user wallet
                if (!deductMoney(user.id, checkLeague.amount)) {
                    return response.status(400).json({
                        status: "Internal Server Error",
                        status_code: 400,
                        message: "There was an error deducting the League amount from user wallet"
                    })
                }
            }


            //Check if user already joined
            let getParticipant = await LeagueParticipantSchema.query().where("league_id", checkLeague.id).andWhere("user_id", user.id).first()

            if (!getParticipant) {
                let JoinLeague = await LeagueParticipantSchema.create({
                    user_id: user.id,
                    league_id: checkLeague.id,
                    user_status: 1
                })

                return response.status(200).json({
                    result: JoinLeague,
                    user: user.id,
                    label: `League Joined`,
                    statusCode: 200,
                    message: `League Joined Successfully`,
                })
            }

            //If already join update user_status to 1
            getParticipant.user_status = 1
            getParticipant.save()


            return response.status(200).json({
                result: getParticipant,
                user: user.id,
                label: `League Joined`,
                statusCode: 200,
                message: `League Joined Successfully`,
            })


        } catch (error) {
            console.log(error)
            return response.status(500).json({
                error: error,
                status: "Internal Server Error",
                status_code: 500,
                message: "There was an error joining the Private League"
            })

        }

    }

    //Leave Private League
    async leaveLeague({ request, response, auth }) {
        //Auth User
        const user = auth.current.user

        //Get User Wallet
        const userWallet = await Database.from('wallets').where({ user_id: user.id })

        //User Wallet Handling    
        async function addMoney(amount) {
            try {
                userWallet.balance = userWallet.balance + amount
                userWallet.save()
                return true
            } catch (error) {
                return false
            }
        }

        try {
            //Get League Invite Code
            let { league_code, league_id } = request.all()

            //Check League with league code
            const checkLeague = await League.query().where("id", league_id).andWhere("league_invite_code", league_code).first()

            if (!checkLeague) {
                return response.status(404).json({
                    status: "League not found",
                    status_code: 404,
                    message: `The League with Invite Code ${league_code} not found`
                })
            }

            //Check if league has already started and if you can leave league
            let SystemSetting = await SystemSettings.first()

            if (SystemSetting) {
                if (SystemSetting.leave_league_in_between_league == 0) {
                    return response.status(400).json({
                        status: "You can not Leave the league",
                        status_code: 400,
                        message: "The LEague has already been started, can not leave"
                    })
                }
            }

            //Check if is paid league            
            if (checkLeague.league_paid == 'Yes') {
                //deduct league fee from user wallet
                if (!addMoney(checkLeague.amount)) {
                    return response.status(400).json({
                        status: "Internal Server Error",
                        status_code: 400,
                        message: "There was an error adding the League amount paid to user wallet"
                    })
                }
            }


            //Update user user_status to 0
            let getParticipant = await LeagueParticipantSchema.query().where("league_id", checkLeague.id).andWhere("user_id", user.id).first()
            getParticipant.user_status = 0
            getParticipant.save()


            return response.status(200).json({
                result: getParticipant,
                user: user.id,
                label: `League Left`,
                statusCode: 200,
                message: `League Left Successfully`,
            })


        } catch (error) {
            console.log(error)
            return response.status(500).json({
                error: error,
                status: "Internal Server Error",
                status_code: 500,
                message: "There was an error leaving the League"
            })

        }

    }
}

module.exports = PrivateLeagueController