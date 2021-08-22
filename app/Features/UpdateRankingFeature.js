"use strict"
const PointRanking = use("App/Models/PointRanking");
const Player = use("App/Models/Player");
const PlayerSquad  = use("App/Models/PlayerSquad");
const WeekSeason  = use("App/Models/WeekSeason");
const SquadPoints = use("App/Models/SquadPoint");
const makeExternalRequestFeature = use("App/Features/MakeExternalRequestFeature");
const Config = use("Config");
const Env = use("Env");
const moment = use('moment')
const safeAwait = require("safe-await");
const PointParams = use("App/Models/PointParam")

 

class UpdateRankingFeature {
  constructor(data) {
    this.data = data;
  }

  async updateRankings(){

    async function updatePlayerScores(paramType , playerInfo){
      // get points for goals for player

    const currentweekSeason  = await WeekSeason.query().where("is_current", 1).first()
    //  Get all player in squads with id passed 
    const playerToUpdate =  await PlayerSquad.query()
        .where({
          player_id:playerInfo[0],
          week_season_id: currentweekSeason.id
        }).fetch()
      
        if(!playerToUpdate){
          return{
            status:"Internal Server Error", 
            status_code:500, 
            message: "Player not found"
          } 
        }
        const playersToUpdate = playerToUpdate.toJSON()
        
        console.log({playersToUpdate});
        for (let i = 0; i < playersToUpdate.length; i++) {
          const currentPlayer = playersToUpdate[i];
            // get points to be given to player based on thier wing 
            const pointParameters = await PointParams.query().where({
              param_type: paramType,
              player_type: currentPlayer.wing
            }).first()

            const pointsForPlayer = pointParameters.points

          const currentPlayerUpdate = await PlayerSquad.query().where("id",currentPlayer.id).first()
          
          currentPlayerUpdate.points_total =   currentPlayerUpdate.points_total + pointsForPlayer
          const responseFromUpdate = await currentPlayerUpdate.save()

            // update squad points 
            const updateSquadPoints = await SquadPoints.query().where(
              { 
                squad_id:currentPlayer.squad_id ,
                week_season_id: currentweekSeason.id
              }).first()

              if (!updateSquadPoints) {
                await SquadPoints.findOrCreate(
                  { 
                    squad_id:currentPlayer.squad_id ,
                    week_season_id:  currentweekSeason.id,
                    points_total:pointsForPlayer
                  }
                )
              } else {
                updateSquadPoints.points_total =  updateSquadPoints.points_total + pointsForPlayer
              await updateSquadPoints.save()
              }
        } 
    }
    try {
      // get today fixtures 
      // get players by fixtures
      // run each player by fixture 
      // update user stats 
      const getAllPlayerIds  = await Player.query().pluck("player_id")
      const fixturesBaseUrl = Config.get("rapidApi.getWeekFixturesEndpoint")
      const playerBaseUrl = Config.get("rapidApi.getFixturePlayers")
      const currentyear = new Date().getFullYear()-1;
      // let today = moment().format('YYYY-MM-DD')
      let today = "2021-01-12"

      const teamEndpoints = [ 
        // `${fixturesBaseUrl}?league=39&season=${currentyear}&date=${today}`,
        // `${fixturesBaseUrl}?league=135&season=${currentyear}&date=${today}`,
        // `${fixturesBaseUrl}?league=61&season=${currentyear}&date=${today}`,
        // `${fixturesBaseUrl}?league=78&season=${currentyear}&date=${today}`,
        `${fixturesBaseUrl}?league=140&season=${currentyear}&date=${today}`
        ];        

      let promises = [];
      for (let i = 0; i < teamEndpoints.length; i++) {
        const responseFromApi = await new makeExternalRequestFeature(
          {endpoint:teamEndpoints[i]
        }
        ).makeGetRequest()
        if(responseFromApi.results){
          let responseTeamObject = responseFromApi.results
          for(let j = 0 ;j < responseTeamObject.response.length; j++ ){
              promises.push(responseTeamObject.response[j])
            }
        }
      } 
      Promise.all(promises)

      // get all fixture IDs  for current day
      let fixtureIds = []
      for (let i = 0; i < promises.length; i++) {
        fixtureIds.push(promises[i].fixture.id)
      }

      // pull players for every fixture on that day
      let playerFixtureStatistics = [];
      for (let i = 0; i < fixtureIds.length; i++) {
        const fixtureEndpoint = `${playerBaseUrl}?fixture=${fixtureIds[i]}`
        const responseFromApi = await new makeExternalRequestFeature(
          {endpoint:fixtureEndpoint}
        ).makeGetRequest()
        if(responseFromApi){
          let singleFixturePlayers = responseFromApi.results.response[0].players
          console.log({singleFixturePlayers});
          for(let j = 0 ;j < singleFixturePlayers.length; j++ ){
            playerFixtureStatistics.push(singleFixturePlayers[j])
          }
        }
      } 
      console.log("playerFixtureStatistics" , playerFixtureStatistics.length);
      
      // compare players in system to players in fixtures that day 
      for (let i = 0; i < playerFixtureStatistics.length ; i++) {
          if(getAllPlayerIds.includes(playerFixtureStatistics[i].player.id)){
           console.log("THIS MATCHES" , playerFixtureStatistics[i].player.id); 
            const getPlayerInSystem = await Player.query().where("player_id", playerFixtureStatistics[i].player.id ).pluck("id")
           
            // check if player scored a goal
            const playerGoalStat =  playerFixtureStatistics[i].statistics["0"].goals
            let paramType;
            if(playerGoalStat.total){ //CHECK THIS LOGIC HERE AGAIN 
               paramType = "Goal";
              //  console.log({getPlayerInSystem});
               const resultFromUpdate =await updatePlayerScores(paramType,   getPlayerInSystem)
               console.log({resultFromUpdate});
            }
            else if(!playerGoalStat.conceded){
              paramType = "Clean Sheet";
              const resultFromUpdate =await updatePlayerScores(paramType,  getPlayerInSystem)
              console.log({resultFromUpdate});
            }
            else if(playerGoalStat.assists){
              paramType = "Goal Assist";
              const resultFromUpdate =await updatePlayerScores(paramType,  getPlayerInSystem)
              console.log({resultFromUpdate});
            }
          } 
      }
    } catch (updatePointsError) {
      console.log("update Points rankings >>>>>", updatePointsError);
      return {
          status:"Internal Server Error", 
          status_code:500, 
          message: "There was an error updating Points "
       }
    }
  }
}

module.exports = UpdateRankingFeature


