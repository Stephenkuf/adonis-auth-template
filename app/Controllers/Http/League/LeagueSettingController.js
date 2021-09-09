'use strict'

const LeagueParticipantSchema = use("App/Models/LeagueParticipant");
const League = use("App/Models/League");
const TeamSquad = use("App/Models/TeamSquad");
const Database = use('Database')
const PlayerSquad = use("App/Models/PlayerSquad");
const Config = use("Config");
const makeExternalRequestFeature = use("App/Features/MakeExternalRequestFeature");
const Wallet = use("App/Models/Wallet");
const SystemSettings = use('App/Models/SystemSetting')
const leagueComment = use('App/Models/LeagueComment')

class LeagueSettingController {

    //Join League With Code
    async joinLeagueWithCode({
        request,
        response,
        auth
    }) {
        //Auth User
        const user = auth.current.user

        //Get User Wallet
        const userWallet = await Wallet.query().where("user_id", user.id).first()

        //Format date        
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

        try {
            //Get League Invite Code
            let {
                league_code,
                team_id
            } = request.all()

            //Check League with league code
            const checkLeague = await League.query().where("league_invite_code", league_code).first()

            if (!checkLeague) {
                return response.status(404).json({
                    label: "League not found",
                    status_code: 404,
                    message: `The League with Invite Code ${league_code} not found`
                })
            }

            //Check if league has started or ended
            if (checkLeague.league_status == "started" || checkLeague.league_status == "ended") {
                return response.status(400).json({
                    label: "League has already started or ended",
                    status_code: 400,
                    message: `The League ${checkLeague.league_name} has already started or ended`
                })
            }

            //Check if the Squad ID Exist
            const checkSquad = await TeamSquad.query().where("user_id", user.id).andWhere("team_name_id", team_id).first()
            if (!checkSquad) {
                return response.status(400).json({
                    label: "Team not found",
                    status_code: 400,
                    message: `The Team with ID ${team_id} not found`
                })
            }
            //Check if user already joined
            let getParticipant = await LeagueParticipantSchema.query().where("league_id", checkLeague.id).andWhere("user_id", user.id).andWhere("team_id", team_id).first()
            if (getParticipant) {
                if (getParticipant.user_status == 1) {
                    return response.status(400).json({
                        label: "You've already joined",
                        status_code: 400,
                        message: `The User  ${user.id} has already joined the league`
                    })
                }
            }

            //Get all Squad Player
            const playerIds = []
            const teamPlayerSquad = await Database.from('player_squads').where({
                squad_id: checkSquad.id
            })
            teamPlayerSquad.forEach(function (player) {
                playerIds.push(player.player_id);
            });
            //Check if Team Squad has player
            if (!playerIds.length) {
                return response.status(400).json({
                    label: "No player found for this Team Squad",
                    status_code: 400,
                    message: `There is not player found for the Team Squad with ID ${checkSquad.id}`
                })
            }

            //Check if user wallet exist
            if (!userWallet) {
                return response.status(400).json({
                    label: "User Wallet not found",
                    status_code: 400,
                    message: `The wallet ${team_id} not found`
                })
            }

            //Check if is paid league            
            if (checkLeague.league_paid == 1) {
                //Check if user have enough balance in wallet
                if (!userWallet.balance || userWallet.balance < checkLeague.amount) {
                    return response.status(400).json({
                        label: "no sufficient fund",
                        status_code: 400,
                        balance: userWallet.balance,
                        League_amount: checkLeague.amount,
                        message: "The user wallet is not sufficient for the league amount"
                    })
                }
            }

            var leagueIdArray = [];
            var playerDetailsArray = [];
            var playerIdArray = [];

            //Get Current year for the season year         
            var dateNow = new Date();
            var season = dateNow.getFullYear()

            //Get all the League IDs involve in the league
            var leaguesId = checkLeague.allowed_league_id
            var allLeagueId = leaguesId.replace(/[\[\]']+/g, '').split(',')
            var checker = (arr, target) => target.every(v => arr.includes(v));


            //Get All Fixtures IDs of League involve in this League
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

            //Get ALl the players for the Leagues with Fixture ID
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

            //Check through the User Team Squad Player if there is any player among but is not selected in the fixtures within the league duration
            if (!checker(playerIdArray, playerIds)) {
                let difference = playerIds.filter(x => !playerIdArray.includes(x));
                return response.status(400).json({
                    PlayersID: playerIdArray,
                    YourTeamSquadPlayer: playerIds,
                    excludePlayers: difference,
                    label: `League can not be Joined`,
                    statusCode: 400,
                    message: `You have players that is not amoung the game fixtures in your team`,
                })
            }

            //Deduct Momet From User Wallet
            if (checkLeague.league_paid == 1) {
                return response.status(200).json({
                    result: checkLeague,
                    user: user.id,
                    label: userWallet.balance,
                    statusCode: checkLeague.amount,
                    message: `League Joined Successfully`,
                })
            }

            //Create if user has not joined
            if (!getParticipant) {
                let JoinLeague = await LeagueParticipantSchema.create({
                    user_id: user.id,
                    league_id: checkLeague.id,
                    team_id: team_id,
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
                label: "Internal Server Error",
                status_code: 500,
                message: "There was an error joining the Private League"
            })
        }

    }

    //Join League    
    async joinLeague({
        response,
        params,
        auth
    }) {
        //Auth User
        const user = auth.current.user

        //Get User Wallet
        const userWallet = await Wallet.query().where("user_id", user.id).first()

        //Format date        
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

        try {
            //Get League Invite Code
            let {
                league_id,
                team_id
            } = params

            //Check League with league ID
            const checkLeague = await League.query().where("id", league_id).first()

            if (!checkLeague) {
                return response.status(404).json({
                    label: "League not found",
                    status_code: 404,
                    message: `The League with the ID ${league_id} not found`
                })
            }

            //Check if league has started or ended
            if (checkLeague.league_status == "started" || checkLeague.league_status == "ended") {
                return response.status(400).json({
                    label: "League has already started or ended",
                    status_code: 400,
                    message: `The League ${checkLeague.league_name} has already started or ended`
                })
            }

            //Check if the Squad ID Exist
            const checkSquad = await TeamSquad.query().where("user_id", user.id).andWhere("team_name_id", team_id).first()
            if (!checkSquad) {
                return response.status(400).json({
                    label: "Team not found",
                    status_code: 400,
                    message: `The Team with ID ${team_id} not found`
                })
            }

            //Check if user already joined
            let getParticipant = await LeagueParticipantSchema.query().where("league_id", checkLeague.id).andWhere("user_id", user.id).andWhere("team_id", team_id).first()
            if (getParticipant) {
                if (getParticipant.user_status == 1) {
                    return response.status(400).json({
                        label: "You've already joined",
                        status_code: 400,
                        message: `The User  ${user.id} has already joined the league`
                    })
                }
            }

            //Get all Squad Player
            const playerIds = [19465]
            const teamPlayerSquad = await Database.from('player_squads').where({
                squad_id: checkSquad.id
            })
            teamPlayerSquad.forEach(function (player) {
                playerIds.push(player.player_id);
            });
            //Check if Team Squad has player
            if (!playerIds.length) {
                return response.status(400).json({
                    label: "No player found for this Team Squad",
                    status_code: 400,
                    message: `There is not player found for the Team Squad with ID ${checkSquad.id}`
                })
            }

            //Check if user wallet exist
            if (!userWallet) {
                return response.status(400).json({
                    label: "User Wallet not found",
                    status_code: 400,
                    message: `The wallet ${team_id} not found`
                })
            }

            //Check if is paid league            
            if (checkLeague.league_paid == 1) {
                //Check if user have enough balance in wallet
                if (!userWallet.balance || userWallet.balance < checkLeague.amount) {
                    return response.status(400).json({
                        label: "no sufficient fund",
                        status_code: 400,
                        balance: userWallet.balance,
                        League_amount: checkLeague.amount,
                        message: "The user wallet is not sufficient for the league amount"
                    })
                }
            }

            var leagueIdArray = [];
            var playerDetailsArray = [];
            var playerIdArray = [];

            //Get Current year for the season year         
            var dateNow = new Date();
            var season = dateNow.getFullYear()

            //Get all the League IDs involve in the league
            var leaguesId = checkLeague.allowed_league_id
            var allLeagueId = leaguesId.replace(/[\[\]']+/g, '').split(',')
            var checker = (arr, target) => target.every(v => arr.includes(v));


            //Get All Fixtures IDs of League involve in this League
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

            //Get ALl the players for the Leagues with Fixture ID
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

            //Check through the User Team Squad Player if there is any player among but is not selected in the fixtures within the league duration
            if (!checker(playerIdArray, playerIds)) {
                let difference = playerIds.filter(x => !playerIdArray.includes(x));
                return response.status(400).json({
                    PlayersID: playerIdArray,
                    YourTeamSquadPlayer: playerIds,
                    excludePlayers: difference,
                    label: `League can not be Joined`,
                    statusCode: 400,
                    message: `You have players that is not amoung the game fixtures in your team`,
                })
            }

            
            //Deduct Momet From User Wallet
            if (checkLeague.league_paid == 1) {
                userWallet.balance = userWallet.balance - checkLeague.amount
                userWallet.save()
            }


            //Create if user has not joined
            if (!getParticipant) {
                let JoinLeague = await LeagueParticipantSchema.create({
                    user_id: user.id,
                    league_id: checkLeague.id,
                    team_id: team_id,
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
                label: "Internal Server Error",
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
        const userWallet = await Wallet.query().where("user_id", user.id).first()

        try {

            //Get League ID
            let {
                league_id,
                team_id
            } = params
            //Check League
            const checkLeague = await League.find(league_id)

            if (!checkLeague) {
                return response.status(404).json({
                    status: "League not found",
                    status_code: 404,
                    message: `The League with ID ${league_id} not found`
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
            //Check if user already joined
            let getParticipant = await LeagueParticipantSchema.query().where("league_id", checkLeague.id).andWhere("user_id", user.id).andWhere("team_id", team_id).first()
            if (!getParticipant) {
                return response.status(400).json({
                    label: "User Record not found for this league",
                    status_code: 400,
                    message: `The User  ${user.id} with League ID ${league_id} and Team ID ${team_id} is not found`
                })
            }

            if(getParticipant.user_status == 0){
                return response.status(400).json({
                    label: "User Already left LEague",
                    status_code: 400,
                    message: `The User  ${user.id} with League ID ${league_id} and Team ID ${team_id} has already left the league`
                })
            }


            //Check if is paid league            
            if (checkLeague.league_paid == 1) {
                userWallet.balance = userWallet.balance + checkLeague.amount
                userWallet.save()
            }
            
            //Update user user_status to 0
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

    //League Comment
    async leagueComment({
        request,
        response,
        auth
    }){
        //Auth User
        const user = auth.current.user

        //Get User Wallet
        const userWallet = await Wallet.query().where("user_id", user.id).first()

        try {
            //Get League Invite Code
            let {
                league_id,
                team_id,
                comment
            } = request.all()

            //Check League with league code
            const checkLeague = await League.query().where("id", league_id).first()

            if (!checkLeague) {
                return response.status(404).json({
                    label: "League not found",
                    status_code: 404,
                    message: `The League with Invite Code ${league_id} not found`
                })
            }

            //Check if league has started or ended
            if (checkLeague.league_status != "ended") {
                return response.status(400).json({
                    label: "League has not ended yet",
                    status_code: 400,
                    message: `The League ${checkLeague.league_name} has ended yet`
                })
            }

            //Check if the Squad ID Exist
            const checkSquad = await TeamSquad.query().where("user_id", user.id).andWhere("team_name_id", team_id).first()
            if (!checkSquad) {
                return response.status(400).json({
                    label: "Team not found",
                    status_code: 400,
                    message: `The Team with ID ${team_id} not found`
                })
            }

            //Check if user already joined
            let getParticipant = await LeagueParticipantSchema.query().where("league_id", checkLeague.id).andWhere("user_id", user.id).andWhere("team_id", team_id).first()
            if (!getParticipant.user_status) {
                return response.status(400).json({
                    label: "You are not a participant of the League",
                    status_code: 400,
                    message: `The User is not a participant of ${checkLeague.league_name} league`
                })
            }

            //Save Comment
            let saveComment = await leagueComment.create({
                league_id: checkLeague.id,
                user_id: user.id,
                team_id: checkSquad.id,
                date: new Date(),
                comment: comment
            })
            

            return response.status(200).json({
                result: saveComment,
                label: `Comment Saved`,
                statusCode: 200,
                message: `League Comment Saved Successfully`,
            })

            
        } catch (error) {
            console.log(error)
            return response.status(500).json({
                error: error,
                label: "Internal Server Error",
                status_code: 500,
                message: "There was an error commenting"
            })            
        }

    }

    //Get League Comment
    async getLeagueComment({
        params,
        response,
        auth
    }){
        //Auth User
        const user = auth.current.user

        //Get User Wallet
        const userWallet = await Wallet.query().where("user_id", user.id).first()

        try {
            //Get League Invite Code
            let {
                league_id,
            } = params

            //Check League with league code
            const checkLeague = await League.query().where("id", league_id).first()

            if (!checkLeague) {
                return response.status(404).json({
                    label: "League not found",
                    status_code: 404,
                    message: `The League with Invite Code ${league_id} not found`
                })
            }

            const allComments = await Database.table('league_comments').where('league_id', checkLeague.id).orderBy('created_at', 'desc')

            return response.status(200).json({
                result: allComments,
                label: `League Comments`,
                statusCode: 200,
                message: `League Comment Fetched Successfully`,
            })

            
        } catch (error) {
            console.log(error)
            return response.status(500).json({
                error: error,
                label: "Internal Server Error",
                status_code: 500,
                message: "There was an error getting league comment"
            })            
        }

    }
}

module.exports = LeagueSettingController