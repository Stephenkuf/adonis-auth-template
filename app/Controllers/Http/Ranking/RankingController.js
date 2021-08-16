'use strict'
const SquadPoints = use("App/Models/SquadPoint");
const WeekSeason  = use("App/Models/WeekSeason");
const TeamSquad  = use("App/Models/TeamSquad");
const PlayerSquad  = use("App/Models/PlayerSquad");

class RankingController {
    async viewSquadRankings({response , auth }){
        try {
            const user = auth.current.user
            const currentweekSeason  = await WeekSeason.query().where("is_current", 1).first()

            const getWeeklyRanking =  await SquadPoints.query()
            .where("week_season_id", currentweekSeason.id)
            .with("squad" ,builder => builder.with("teamName"))
            .orderBy("points_total" , "desc")
            .fetch()
        
            return response.status(200).json({
                result: getWeeklyRanking,
                label: `Rankings`,
                statusCode: 200,
                message: `Rankings Fetched successfully`,
            })
        } catch (viewRankingsError) {
            console.log("ViewSquad Error >>>>> ", viewRankingsError);
            return response.status(500).json({
                result:viewRankingsError, 
                status:"Internal Server Error", 
                status_code:500, 
                message: "There was an error fetchingRankings"
        })  
        }
    }
    async userTeamRankings({ response , auth }){
        try {
            const user = auth.current.user
            const currentweekSeason  = await WeekSeason.query().where("is_current", 1).first()
            const userSquad  = await TeamSquad.query().where("user_id", user.id).first()

            const teamWeekStats =  await SquadPoints.query()
            .where("squad_id",userSquad.id )
            .where("week_season_id", currentweekSeason.id)
            .with("squad" ,builder => builder.with("teamName"))
            .orderBy("points_total" , "desc")
            .fetch()

            console.log({userSquad});

            const getPlayerWeekRanking =  await PlayerSquad.query()
            .where("squad_id", userSquad.id)
            .andWhere("week_season_id", currentweekSeason.id)
            .with("player")
            .orderBy("points_total" , "desc")
            .fetch()
        

            return response.status(200).json({
                result:{
                    squadStats:getPlayerWeekRanking,
                    currentGameweek:currentweekSeason.week,
                    teamInfo:teamWeekStats,
            
                }  ,
                label: `User team Rankings`,
                statusCode: 200,
                message: `User Team Rankings Fetched successfully`,
            })
        } catch (viewRankingsError) {
            console.log("View Squad Error >>>>> ", viewRankingsError);
            return response.status(500).json({
                result:viewRankingsError, 
                status:"Internal Server Error", 
                status_code:500, 
                message: "There was an error fetching Rankings"
            }) 
        }
    }
}

module.exports = RankingController;