'use strict'

const LeagueParticipantSchema = use("App/Models/LeagueParticipant");
const League = use("App/Models/League");
const User = use("App/Models/User");
const SystemSettings = use('App/Models/SystemSetting')

class PublicLeagueController {

    //Join Public League
    async joinLeague({ response, params, auth }) {
        //User Wallet Handling    
        async function addMoney(userId, amount) {
            try {
                let userData = await User.find(userId)
                userData.wallet = userData.wallet - amount
                userData.save()
                return true
            } catch (error) {
                return false
            }
        }

        try {
            //Auth User
            const user = auth.current.user

            //Get League ID
            let leagueId = params

            //Check League
            const checkLeague = await League.find(leagueId.league_id)

            if (!checkLeague) {
                return response.status(404).json({
                    status: "League not found",
                    status_code: 404,
                    message: `The League with ID ${leagueId.league_id} not found`
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
                if (checkLeague.amount > user.wallet) {
                    return response.status(400).json({
                        status: "no sufficient fund",
                        status_code: 400,
                        message: "The user wallet is not sufficient for the league amount"
                    })
                }

                //deduct league fee from user wallet
                if (addMoney(user.id, checkLeague.amount)) {
                    return response.status(400).json({
                        // error: error,
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
                message: "There was an error joining the League"
            })

        }

    }

    //Leave Public League
    async leaveLeague({ response, params, auth }) {
        //User Wallet Handling    
        async function deductMoney(userId, amount) {
            try {
                let userData = await User.find(userId)
                userData.wallet = userData.wallet + amount
                userData.save()
                return true
            } catch (error) {
                return false
            }
        }

        try {
            //Auth User
            const user = auth.current.user

            //Get League ID
            let leagueId = params

            //Check League
            const checkLeague = await League.find(leagueId.league_id)

            if (!checkLeague) {
                return response.status(404).json({
                    status: "League not found",
                    status_code: 404,
                    message: `The League with ID ${leagueId.league_id} not found`
                })
            }

            //Check if league has been ended
            if (checkLeague.league_status == "ended") {
                return response.status(400).json({
                    status: "League has been ended",
                    status_code: 400,
                    message: `The League ${checkLeague.league_name} has been ended`
                })
            }

            //Check if league has already started and if you can leave league
            let SystemSetting = await SystemSettings.first()

            if (SystemSetting.leave_league_in_between_league == 0) {
                return response.status(400).json({
                    status: "You can not Leave the league",
                    status_code: 400,
                    message: "The LEague has already been started, can not leave"
                })
            }

            //Check if is paid league            
            if (checkLeague.league_paid == 'Yes') {

                //deduct league fee from user wallet
                if (deductMoney(user.id, checkLeague.amount)) {
                    return response.status(400).json({
                        error: error,
                        status: "Internal Server Error",
                        status_code: 400,
                        message: "There was an error adding the League amount to user wallet"
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

module.exports = PublicLeagueController