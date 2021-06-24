"use strict"
const PointRanking = use("App/Models/PointRanking");
const PointSetting = use("App/Models/PointSetting");
const Player = use("App/Models/Player");
const PlayerSquad  = use("App/Models/PlayerSquad");
const WeekSeason  = use("App/Models/WeekSeason");
const League = use("App/Models/League");
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

    async function updatePlayerScores(paramType , playerSquadDetails , playerInfo){
      // get points for goals for player

      console.log({playerSquadDetails});
      const pointParameters = await PointParams.query().where({
        param_type: paramType,
        player_type: playerSquadDetails.wing
      }).first()

      const currentweekSeason  = await WeekSeason.query().where("is_current_week", 1).andWhere("is_current_season",  1).first()
      const pointSettings = await PointSetting.query().where("param_id" ,pointParameters.id).first()
      const pointsForPlayer = pointSettings.points
    const playerToUpdate =  await PlayerSquad.query()
        .where({
          player_id:playerInfo[0],
          week_season_id: currentweekSeason.id
        }).first()


      if(!playerToUpdate){
        return{
          status:"Internal Server Error", 
          status_code:500, 
          message: "Player not found"
        } 
      }
      else{
        playerToUpdate.points_total = playerToUpdate.points_total + pointsForPlayer
        const responseFromUpdate = await  playerToUpdate.save()

        // update squad points 
        const updateSquadPoints = await League.query().where(
          { 
            player_squad_id:playerSquadDetails.squad_id ,
            week_season_id: currentweekSeason.id
          }).first()

          if (!updateSquadPoints) {
            await League.findOrCreate(
              { 
                player_squad_id:playerSquadDetails.squad_id ,
                week_season_id:  currentweekSeason.id,
                points_total:pointsForPlayer
              })
    
          } else {
            updateSquadPoints.points_total =  updateSquadPoints.points_total + pointsForPlayer
           await updateSquadPoints.save()
          }

        return responseFromUpdate
      }
       
    }

    try {
      // get today fixtures 
      // get players by fixtures
      // run each player by fixture 
      // update user stats 
      const getAllPlayerIds  = await Player.query().pluck("player_id")
      const getPointSettings = await PointSetting.query().fetch()

      const fixturesBaseUrl = Config.get("rapidApi.getWeekFixturesEndpoint")
      const playerBaseUrl = Config.get("rapidApi.getFixturePlayers")
      const currentyear = new Date().getFullYear()-1;
      // let today = moment().format('YYYY-MM-DD')
      let today = "2021-01-12"

      const teamEndpoints = [ 
        `${fixturesBaseUrl}?league=39&season=${currentyear}&date=${today}`,
        `${fixturesBaseUrl}?league=135&season=${currentyear}&date=${today}`,
        `${fixturesBaseUrl}?league=61&season=${currentyear}&date=${today}`,
        `${fixturesBaseUrl}?league=78&season=${currentyear}&date=${today}`,
        `${fixturesBaseUrl}?league=140&season=${currentyear}&date=${today}`
        ];        

      let promises = [];
      for (let i = 0; i < teamEndpoints.length; i++) {
        const responseFromApi = await new makeExternalRequestFeature(
          {endpoint:teamEndpoints[i]
         }
        ).makeGetRequest()
        let responseTeamObject = responseFromApi.results
        for(let j = 0 ;j < responseTeamObject.response.length; j++ ){
            promises.push(responseTeamObject.response[j])
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
        
        let singleFixturePlayers = responseFromApi.results.response[0].players
          // console.log(singleFixturePlayers[0].player);
        for(let j = 0 ;j < singleFixturePlayers.length; j++ ){
          playerFixtureStatistics.push(singleFixturePlayers[j])
          }
      } 
      console.log("playerFixtureStatistics" , playerFixtureStatistics.length);
      // compare players in system to players in fixtures that day 
      for (let i = 0; i < playerFixtureStatistics.length ; i++) {
          if(getAllPlayerIds.includes(playerFixtureStatistics[i].player.id)){
           console.log("THIS MATCHES" , playerFixtureStatistics[i].player.id); 
            const getPlayerInSystem = await Player.query().where("player_id", playerFixtureStatistics[i].player.id ).pluck("id")
            const getPlayerDetails = await PlayerSquad.query()
                  .where({
                      player_id: getPlayerInSystem[0]
                  })
                  .fetch()

            const  playerDetailsJson = getPlayerDetails.toJSON();
            const playerSquadDetails = playerDetailsJson[0]
            // check if player scored a goal
            const playerGoalStat =  playerFixtureStatistics[i].statistics["0"].goals
            let paramType;
            if(playerGoalStat.total){ //CHECK THIS LOGIC HERE AGAIN 
               paramType = "Goal";
               const resultFromUpdate =await updatePlayerScores(paramType, playerWing,  getPlayerInSystem)
               console.log({resultFromUpdate});
            }
            else if(!playerGoalStat.conceded){
              paramType = "Clean Sheet";
              const resultFromUpdate =await updatePlayerScores(paramType, playerSquadDetails,  getPlayerInSystem)
              console.log({resultFromUpdate});
            }
            else if(playerGoalStat.assists){
              paramType = "Goal Assist";
              const resultFromUpdate =await updatePlayerScores(paramType, playerWing,  getPlayerInSystem)
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


