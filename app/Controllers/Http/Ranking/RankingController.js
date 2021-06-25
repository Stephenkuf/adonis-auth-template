'use strict'

const League = use("App/Models/League");
const WeekSeason  = use("App/Models/WeekSeason");
const TeamSquad  = use("App/Models/TeamSquad");
const PlayerSquad  = use("App/Models/PlayerSquad");

class RankingController {
    async viewSquadRankings({response , auth }){
        try {
            const user = auth.current.user
            const currentweekSeason  = await WeekSeason.query().where("is_current_week", 1).andWhere("is_current_season",  1).first()

            const getWeeklyRanking =  await League.query()
            .where("week_season_id", currentweekSeason.id)
            .with("squad" ,builder => builder.with("teamName"))
            .orderBy("points_total" , "desc")
            .fetch()
        
            return response.status(200).json({
                result: getWeeklyRanking,
                label: `Rankings `,
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
            const currentweekSeason  = await WeekSeason.query().where("is_current_week", 1).andWhere("is_current_season",  1).first()
            const userSquad  = await TeamSquad.query().where("user_id", user.id).first()

            const getPlayerWeekRanking =  await PlayerSquad.query()
            .where("squad_id", userSquad.id)
            .andWhere("week_season_id", currentweekSeason.id)
            .with("player")
            .orderBy("points_total" , "desc")
            .fetch()
        
            return response.status(200).json({
                result: getWeeklyRanking,
                label: `Rankings `,
                statusCode: 200,
                message: `Rankings Fetched successfully`,
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