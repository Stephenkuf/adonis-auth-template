'use strict'
const Config = use("Config");
const Countries = use("App/Models/SettingsCountry")
const axios = require('axios');
const makeExternalRequestFeature = use("App/Features/MakeExternalRequestFeature");
const updatePointsFeature = use("App/Features/UpdateRankingFeature")

const moment = use('moment')

class MetadatumController {
  async getMetadata({
    request,
    response,
  }) {
    try {
       const countries = await Countries.all();

      const metadata = {
        countries
      }
      return response.status(200).json({
        result: metadata,
        label: `Fetch Metadata`,
        statusCode: 200,
        message: `Metadata Fetched successfully`,
      })

    } catch (error) {
      return response.status(400).json({
        error,
        label: `Metadata Fetching`,
        statusCode: 400,
        message: `We were unable to fetch Metadata`,
      })
    }
  }

  async getSignUpTeamList({ response}){
        //  England
        //   league_id: 2
        //  Italy
        //    league_id: 94
        //  Germany
        //    league_id: 87
        //  Spain
        //  league_id: 8 
        //holland

       try {
        const baseUrl = Config.get("rapidApi.getTeamsByLeagueIdEndpoint")
        
        // async function getEnglandLeague() {
        //   const endpoint = `${baseUrl}/2`
        //   return await new makeExternalRequestFeature({endpoint}).makeGetRequest()
        // }

        const teamEndpoints = [ `${baseUrl}/2`, `${baseUrl}/94`, `${baseUrl}/87`,`${baseUrl}/8` ];        
          let promises = [];
          for (let i = 0; i < teamEndpoints.length; i++) {
            const responseFromApi = await new makeExternalRequestFeature({endpoint:teamEndpoints[i]}).makeGetRequest()
            let responseTeamObject = responseFromApi.results.api.teams
            for(let j = 0 ;j < responseTeamObject.length; j++ ){
              promises.push(responseTeamObject[j])
            }
          }

          Promise.all(promises)
          .then(responses => console.log("responses from request successful"));
          
          return response.status(200).json({
            results:promises,
            label: `Signup teams Fetching`,
            statusCode: 200,
            message: `Teams fetched successfully`,
          })

       } catch (error) {
         console.log("Get signup teams error ",error);
        return response.status(400).json({
          error,
          label: `Signup teams  Fetching`,
          statusCode: 400,
          message: `We were unable to fetch teams`,
        })
       }
  }

  async getAllPlayers({ response}){
   try {
    const baseUrl = Config.get("rapidApi.getPlayer")
    // async function getEnglandLeague() {
    //   const endpoint = `${baseUrl}/2`
    //   return await new makeExternalRequestFeature({endpoint}).makeGetRequest()
    // }

    const currentyear = new Date().getFullYear();
    const teamEndpoints = [ 
      `${baseUrl}?league=39&season=${currentyear}`,
      `${baseUrl}?league=135&season=${currentyear}`,
      `${baseUrl}?league=61&season=${currentyear}`,
      `${baseUrl}?league=78&season=${currentyear}`,
      `${baseUrl}?league=140&season=${currentyear}`,
    ];        
      let promises = [];
      for (let i = 0; i < teamEndpoints.length; i++) {
        const responseFromApi = await new makeExternalRequestFeature({endpoint:teamEndpoints[i]}).makeGetRequest()
        let responseTeamObject = responseFromApi.results.response
        for(let j = 0 ;j < responseTeamObject.length; j++ ){

          let playerObject =  responseTeamObject[j]

          playerObject.player.position = playerObject.statistics[0].games.position
          playerObject.player.team = playerObject.statistics[0].team.name
          playerObject.player.league = playerObject.statistics[0].league.name
          playerObject.player.points = playerObject.statistics[0].league.name

          promises.push(playerObject)
        }
      }
      Promise.all(promises)

      //  promises.forEach(function(v){ delete v.statistics });

      return response.status(200).json({
        results:promises,
        label: `Player list `,
        statusCode: 200,
        message: `Player list fetched successfully`,
      })

   } catch (error) {
     console.log("Get signup teams error ",error);
    return response.status(400).json({
      error,
      label: `Signup teams  Fetching`,
      statusCode: 400,
      message: `We were unable to fetch teams`,
    })
   }
  }

  async getWeekFixtures({response}){  
    try {
      const baseUrl = Config.get("rapidApi.getWeekFixturesEndpoint")
      function getFirstDay(){
        let today = moment()
        const dow = today.day();
        let firstDay 
        if(dow == 5){
          firstDay = today
        }
        else{
         let firstWeekDay = moment().day(0)
          firstDay = firstWeekDay.day(-2)
        }
        return firstDay.format('YYYY-MM-DD')
      }

      function getLastDay(){
        let today = moment()
        const dow = today.day();
        let firstDay, lastDay;
        if(dow == 5){
          firstDay = today
        }
        else{
         let firstWeekDay = moment().day(0)
          firstDay = firstWeekDay.day(-2)
        }
        lastDay =  firstDay.add(6 ,'days').format('YYYY-MM-DD')
        return lastDay;
      }
      
      // let lastWeekDay  = getLastDay();
      // let firstWeekDay  = getFirstDay();

       let lastWeekDay  = "2021-05-24";
       let firstWeekDay  = "2021-02-21";

      const currentyear = new Date().getFullYear() - 1 ;
      const teamEndpoints = [ 
        `${baseUrl}?league=39&season=${currentyear}&from=${firstWeekDay}&to=${lastWeekDay}`,
        `${baseUrl}?league=135&season=${currentyear}&from=${firstWeekDay}&to=${lastWeekDay}`,
        `${baseUrl}?league=61&season=${currentyear}&from=${firstWeekDay}&to=${lastWeekDay}`,
        `${baseUrl}?league=78&season=${currentyear}&from=${firstWeekDay}&to=${lastWeekDay}`,
        `${baseUrl}?league=140&season=${currentyear}&from=${firstWeekDay}&to=${lastWeekDay}`
      ];        
      let promises = [];
        for (let i = 0; i < teamEndpoints.length; i++) {
          const responseFromApi = await new makeExternalRequestFeature(
            {endpoint:teamEndpoints[i]
           }
          ).makeGetRequest()
          let responseTeamObject = responseFromApi.results.response
          for(let j = 0 ;j < responseTeamObject.length; j++ ){

            promises.push(responseTeamObject[j])
          }
        } 
        Promise.all(promises)
          
        return response.status(200).json({
          results:promises,
          label: `Weekly fixtures`,
          statusCode: 200,
          message: `Fixtures fetched successfully`,
        })
     } catch (error) {
       console.log("Get fixtures error ",error);
      return response.status(400).json({
        error,
        label: `Fixtures Fetching`,
        statusCode: 400,
        message: `We were unable to fetch Fixtures`,
      })
     }
  }

  async updateRanking({response}){  
    try {
    let responseFromApi = await new updatePointsFeature({}).updateRankings()

      console.log({responseFromApi});
          
        return response.status(200).json({
          results:responseFromApi,
          label: `Ranking Updated`,
          statusCode: 200,
        })
     } catch (error) {
       console.log("Get fixtures error ",error);
      return response.status(400).json({
        error,
        label: `Rank Update`,
        statusCode: 400,
        message: `We were unable to update`,
      })
     }
  }
}
module.exports = MetadatumController
