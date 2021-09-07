'use strict'

const Config = use("Config");
const LeagueParticipantSchema = use("App/Models/LeagueParticipant");
const League = use("App/Models/League");
const User = use("App/Models/User");
const SystemSettings = use('App/Models/SystemSetting')
const Database = use('Database')
const makeExternalRequestFeature = use("App/Features/MakeExternalRequestFeature");

class PublicLeagueController {

    //Join Public League
    async joinLeague({
        response,
        params,
        auth
    }) {
        //Auth User
        const user = auth.current.user

        //Get User Wallet
        const userWallet = await Database.from('wallets').where({
            user_id: user.id
        })

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
                console.log(userWallet.balance, userWallet, checkLeague.amount)
                if (checkLeague.amount > userWallet.balance) {
                    return response.status(400).json({
                        status: "no sufficient fund",
                        status_code: 400,
                        message: "The user wallet is not sufficient for the league amount"
                    })
                }

                //deduct league fee from user wallet
                if (deductMoney(checkLeague.amount)) {
                    return response.status(400).json({
                        // error: error,
                        status: "Internal Server Error",
                        status_code: 400,
                        message: "There was an error deducting the League amount from user wallet"
                    })
                }
            }
            var dateNow = new Date();
            var leagueIdArray = [];
            var playerDetailsArray = [];
            var playerIdArray = [];
            var playerIds = [
                19465,
                1119,
                19124,
                19789,
                19352,
                15799,
                30407,
                25073,
                19346,
                20589,
                19974,
                19343,
                17772,
                15745,
                77788,
            ]
            var season = dateNow.getFullYear()
            var leaguesId = checkLeague.allowed_league_id
            var allLeagueId = leaguesId.replace(/[\[\]']+/g, '').split(',')
            var checker = (arr, target) => target.every(v => arr.includes(v));

            function formateDate(date) {
                let formatDateNow = new Date(date);
                var dd = formatDateNow.getDate();
                var mm = formatDateNow.getMonth();
                var yyyy = formatDateNow.getFullYear();
                if (dd < 10) {
                    dd = '0' + dd;
                }
                if (mm < 10) {
                    mm = '0' + mm;
                }
                let d = yyyy + "-" + mm + "-" + dd
                return d
            }

            //Get League Fixtures ID
            for (let n = 0; n < allLeagueId.length; n++) {
                // console.log(allLeagueId[n], season, checkLeague.league_start_date, checkLeague.league_end_date)                
                const baseUrl = Config.get("rapidApi.getLeagueFixturesBetweenTwoDates")
                const responseFromApi = await new makeExternalRequestFeature({
                    endpoint: `${baseUrl}?league=${allLeagueId[n]}&season=${season}&from=${formateDate(checkLeague.league_start_date)}&to=${formateDate(checkLeague.league_end_date)}`
                }).makeGetRequest()
                const arr = responseFromApi.results.response
                // console.log(arr)
                let fixturesID = arr.map(arr => arr.fixture.id)
                for (let i = 0; i < fixturesID.length; i++) {
                    leagueIdArray.push(fixturesID[i])
                }
            };

            for (let n = 0; n < leagueIdArray.length; n++) {
                // console.log(allLeagueId[n], season, checkLeague.league_start_date, checkLeague.league_end_date)
                const baseUrl = Config.get("rapidApi.getGamePlayersByFixturesId")
                const responseFromApi = await new makeExternalRequestFeature({
                    endpoint: `${baseUrl}?fixture=${leagueIdArray[n]}`
                }).makeGetRequest()
                const arr = responseFromApi.results.response
                // console.log(arr)
                let fixturesID = arr.map(arr => arr)
                fixturesID.forEach(function (id) {
                    playerDetailsArray.push(id.players);
                });

            };

            for (var i = 0; i < playerDetailsArray.length; i++) {
                for (var j = 0; j < playerDetailsArray[i].length; j++) {
                    playerIdArray.push(playerDetailsArray[i][j].player.id);
                }
            }

            if(!checker(playerIdArray, playerIds)){
                let difference = playerIds.filter(x => !playerIdArray.includes(x));
                return response.status(200).json({
                    result: leagueIdArray,
                    excludePlayers: difference,
                    label: `League can not be Joined`,
                    statusCode: 200,
                    message: `You have players that is not amoung the game fixtures in your team`,
                })
            }

            return response.status(200).json({
                result: leagueIdArray,
                label: `League Joined`,
                statusCode: 200,
                message: `League Joined Successfully`,
            })

            //Check if user already joined
            let getParticipant = await LeagueParticipantSchema.query().where("league_id", checkLeague.id).andWhere("user_id", user.id).first()

            // if (!getParticipant) {
            //     let JoinLeague = await LeagueParticipantSchema.create({
            //         user_id: user.id,
            //         league_id: checkLeague.id,
            //         user_status: 1
            //     })

            //     return response.status(200).json({
            //         result: JoinLeague,
            //         user: user.id,
            //         label: `League Joined`,
            //         statusCode: 200,
            //         message: `League Joined Successfully`,
            //     })
            // }

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
    async leaveLeague({
        response,
        params,
        auth
    }) {
        //Auth User
        const user = auth.current.user

        //Get User Wallet
        const userWallet = await Database.from('wallets').where({
            user_id: user.id
        })

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
                if (addMoney(user.id, checkLeague.amount)) {
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