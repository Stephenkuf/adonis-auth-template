'use strict'

const { first } = require("@adonisjs/lucid/src/Lucid/Model");

const TeamSquad = use("App/Models/TeamSquad");
const TeamName = use("App/Models/TeamName");
const Player = use("App/Models/Player");
const PlayerSquad = use("App/Models/PlayerSquad");
const User = use("App/Models/User");
const Config = use("Config");
const Database = use("Database")
const makeExternalRequestFeature = use("App/Features/MakeExternalRequestFeature")
const moment = use("moment");



class TeamManagementController {

    async createTeam({ request , response, auth }){
        try {
            const user  = auth.current.user
            let {squad_selection,team_name  } = request.all()
            const teamUserCheck = await TeamName.query()
            .where("user_id",user.id).first()


            if(teamUserCheck){
                return response.status(400).json({
                    results:teamUserCheck, 
                    status:"Error", 
                    status_code:400, 
                    message: "User already has created a team"
                 }) 
            }
            
            const teamNameLookup = await Database.raw(`select * from team_names TN where TN.team_name = '${team_name}' `,)

            if(teamNameLookup[0][0]){
                return response.status(400).json({
                    status:"Error", 
                    status_code:400, 
                    message: "Team name exists please choose another Team Name"
                 }) 
            }
            const teamNameCreation  = await TeamName.create({
                user_id:user.id, 
                team_name:team_name
            })
            const squadCreation  = await TeamSquad.findOrCreate({
                user_id:user.id,
                team_name_id:teamNameCreation.id,
            })
            const playerEndpoint  =  Config.get("rapidApi.getPlayer")
            let year = moment().format("YYYY");
            let yearInt = parseInt(year)-1

            squad_selection.forEach(myFunction);
                async function myFunction(item){
                    let itemId  = parseInt(item.id)
                    let currentPlayerEndpoint = `${playerEndpoint}?id=${itemId}&season=${yearInt}`
                     const responseFromApi = await new makeExternalRequestFeature({endpoint:`${currentPlayerEndpoint}`}).makeGetRequest()
                     let currentPlayerDetails  =  responseFromApi.results.response[0].player
                    if ( !item.is_captain){
                        item.is_captain = 0
                    }
                    if ( !item.is_substitute){
                        item.is_substitute = 0
                    }
                
                  console.log("currentPlayerDetails",currentPlayerDetails, currentPlayerDetails.id);
                   const playerInfo =  await Player.findOrCreate({
                            player_name:currentPlayerDetails.name,
                            player_id:currentPlayerDetails.id,
                            player_image:currentPlayerDetails.photo
                    })

                    await PlayerSquad.findOrCreate({
                        player_id: playerInfo.id ,
                        squad_id:squadCreation.id,
                        wing:item.wing,
                        placement:item.placement,
                        is_substitute:item.is_substitute,
                        is_captain: item.is_captain 
                    })
                }

            return response.status(200).json({
                result: teamNameCreation,
                label: `Team Creation`,
                statusCode: 200,
                message: `Team ${team_name} has been created`,
            })
                     
        } catch (createTeamError) {
            console.log("createTeamError >>>>> ", createTeamError);
          return response.status(500).json({
              status:"Internal Server Error", 
              status_code:500, 
              message: "There was an error creating team "
           }) 
        }
    }

    async editTeam({ request , response, auth }){
        try {
            const user  = auth.current.user
            let {squad_selection } = request.all()

            const teamSquadCheck  = await TeamSquad.query().where({
                user_id:user.id
            }).first()

            if(!teamSquadCheck){
                return response.status(400).send({
                    status:"error",
                    message:"User team does not exist . Check the Team name and try again ",
                    status_code:400
                })
            }

            const playerEndpoint  =  Config.get("rapidApi.getPlayer")
            let year = moment().format("YYYY");
            let yearInt = parseInt(year)-1


            const getUserSquad  =  await TeamSquad.query().where({ user_id:user.id}).first() 

            squad_selection.forEach(myFunction);

            async function myFunction(item){
                    let itemId  = parseInt(item.player_id)
                    let currentPlayerEndpoint = `${playerEndpoint}?id=${itemId}&season=${yearInt}`

                    let currentPlayerInfo =  await Player.query().where({
                        player_id:item.player_id
                    }).first() 

                if(currentPlayerInfo){
                    let getCurrentPlayerSquad;
                  if(item.id){
                     getCurrentPlayerSquad  =  await PlayerSquad.query()
                    .where({ squad_id:getUserSquad.id,
                            player_id:item.id })
                    .first() 
                  }
                  else{
                     getCurrentPlayerSquad  =  await PlayerSquad.query()
                    .where({ squad_id:getUserSquad.id})
                    .first() 
                  }
                    if(getCurrentPlayerSquad){
                        getCurrentPlayerSquad.merge({
                            wing:item.wing? item.wing:getCurrentPlayerSquad.wing,
                            is_substitute:item.is_substitute?item.is_substitute: getCurrentPlayerSquad.is_substitute,
                            is_captain: item.is_captain ? item.is_captain : getCurrentPlayerSquad.is_captain
                        })   
    
                        await getCurrentPlayerSquad.save();
                    }
                    else{   
                        await PlayerSquad.findOrCreate({
                            player_id:currentPlayerInfo.id,
                            squad_id:getUserSquad.id,
                            wing:item.wing? item.wing: 0,
                            is_substitute:item.is_substitute?item.is_substitute: 0,
                            is_captain: item.is_captain ?item.is_captain:0
                        })
                        
                    }
                }
                else{
                    let currentPlayerEndpoint = `${playerEndpoint}?id=${itemId}&season=${yearInt}`
                    const responseFromApi = await new makeExternalRequestFeature({endpoint:`${currentPlayerEndpoint}`}).makeGetRequest()
                    let currentPlayerDetails  =  responseFromApi.results.response[0].player
                    if ( !item.is_captain){
                        item.is_captain = 0
                    }
                 const PlayerCreation =  await Player.findOrCreate({
                        player_name:currentPlayerDetails.name,
                        player_id:currentPlayerDetails.id,
                        player_image:currentPlayerDetails.photo
                    })
            
                    await PlayerSquad.findOrCreate({
                        player_id:PlayerCreation.id,
                        squad_id:getUserSquad.id,
                        wing:item.wing? item.wing: 0,
                        is_substitute:item.is_substitute?item.is_substitute: 0,
                        is_captain: item.is_captain ?item.is_captain:0
                    })
                  
                } 
            }

            return response.status(200).json({
                result: teamSquadCheck,
                label: `Team Creation`,
                statusCode: 200,
                message: `Team  Updated successfully`,
            })
                     
        } catch (UpdateTeamError) {
            console.log("UpdateTeamError >>>>> ", UpdateTeamError);
          return response.status(500).json({
              status:"Internal Server Error", 
              status_code:500, 
              message: "There was an error Updating team "
           }) 
        }
    }


   async viewUserTeam({request , response , auth }){
        try {
            const user = auth.current.user

            const userSquad = await TeamSquad.query().where("user_id", user.id).first()
            const teamDetails = await TeamName.query().where("user_id", user.id).first()

            const viewUserTeam = await PlayerSquad.query()
            .where("squad_id", userSquad.id)
            .with("player")
            .fetch()
        
            return response.status(200).json({
                result: {
                    players:viewUserTeam.toJSON(),
                    teamDetails:teamDetails
                },
                label: `Team Fetching`,
                statusCode: 200,
                message: `User team Fetched successfully`,
            })

            
        } catch (viewUserTeamError) {
            console.log(" selectSquadPlayer Error >>>>> ", viewUserTeamError);
            return response.status(500).json({
                status:"Internal Server Error", 
                status_code:500, 
                message: "There was an error viewing User Team"
             })  
        }

    }

    async viewUserProfile({request , response , auth }){
        try {

            const user = auth.current.user

            const viewUserTeam = await User.query()
            .where("id", user.id)
            .with("teamName")
            .setHidden([
                "created_at",
                "password",
                "updated_at",
              ])
            .fetch()
        
            return response.status(200).json({
                result: viewUserTeam,
                label: `User Profile`,
                statusCode: 200,
                message: `User Profile Fetched successfully`,
            })

            
        } catch (viewUserTeamError) {
            console.log(" selectSquadPlayer Error >>>>> ", viewUserTeamError);
            return response.status(500).json({
                status:"Internal Server Error", 
                status_code:500, 
                message: "There was an error getting User profile Player"
             })  
        }

    }

}

module.exports = TeamManagementController
