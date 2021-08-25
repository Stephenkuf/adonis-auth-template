'use strict'
const SquadPoints = use("App/Models/SquadPoint");
const WeekSeason  = use("App/Models/WeekSeason");
const TeamSquad  = use("App/Models/TeamSquad");
const PlayerSquad  = use("App/Models/PlayerSquad");
const TeamName  = use("App/Models/TeamName");

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

            const getTotalPlayers = await TeamName.query()
            .where("is_active",1).andWhere("is_deleted",0)
            .getCount()
            
            const teamWeekStats =  await SquadPoints.query()
            .where("squad_id",userSquad.id )
            .where("week_season_id", currentweekSeason.id)
            .with("squad" ,builder => builder.with("teamName"))
            .orderBy("points_total" , "desc")
            .first()

            const getPlayerWeekRanking =  await PlayerSquad.query()
            .where("squad_id", userSquad.id)
            .andWhere("week_season_id", currentweekSeason.id)
            .with("player")
            .orderBy("points_total" , "desc")
            .fetch()

            const allUserPoints  = await SquadPoints.query()
            .where("squad_id",userSquad.id )
            .pluck("points_total") 

            const allUserWeekSeasons  = await SquadPoints.query()
            .where("squad_id",userSquad.id )
            .getCount() 

            let overallPoints = allUserPoints.reduce((a,b)=> a+b, 0)
            const averageUserPoints = overallPoints/allUserWeekSeasons

            // ranking code
            const systemUsersWeekPoints  = await SquadPoints.query()
            .andWhere("week_season_id", currentweekSeason.id)
            .fetch()  
            let allUsersPoints = systemUsersWeekPoints.toJSON()

            // use slice() to copy the array and not just make a reference
            var sortByPoints = allUsersPoints.slice(0);
            sortByPoints.sort(function(a,b) {
                return b.points_total - a.points_total;
            });

            let userWeekPosition = 0;
            
            for (let i = 0; i < sortByPoints.length; i++) { 
                if (sortByPoints[i].squad_id == userSquad.id) {
                    userWeekPosition = i + 1
                }
            }

            return response.status(200).json({
                result:{
                    overallPoints:overallPoints,
                    userGameWeekPosition:userWeekPosition,
                    averagePoints:averageUserPoints,
                    currentGameweek:currentweekSeason.week,
                    gameweekPoints:teamWeekStats.points_total,
                    totalPlayers:getTotalPlayers,
                    squadStats:getPlayerWeekRanking,
                    teamInfo:teamWeekStats
                } ,
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