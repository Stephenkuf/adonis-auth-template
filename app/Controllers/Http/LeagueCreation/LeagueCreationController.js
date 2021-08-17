'use strict'

const League = use("App/Models/League");
const WeekSeason = use("App/Models/WeekSeason");
const randomString = require("randomstring");


class LeagueCreationController {


    //League Creation with Name
    async createLeague({ request, response, auth }) {

        try {
            //Current Auth User          
            let user = auth.current.user

            //Validate Request
            let { league_name } = request.all()


            //Check if Leageue Name Already Exist
            // const checkLeagueName = await League.query().where("name", name).first()

            // if (checkLeagueName) {
            //     return response.status(400).json({
            //         results: checkLeagueName,
            //         status: "Error",
            //         status_code: 400,
            //         message: "League Name has already exist"
            //     })
            // }

            //Generate league unique invite code
            let league_invite_code = randomString.generate({
                length: 8,
            }).toUpperCase();


            //Save
            let leagueNameCreation = await League.create({
                user_id: user.id,
                league_name: league_name,
                league_invite_code: league_invite_code
            })


            return response.status(200).json({
                result: leagueNameCreation,
                label: `League Creation`,
                statusCode: 200,
                message: `League ${league_name} has been created`,
            })

        } catch (error) {
            console.log(error)
            return response.status(500).json({
                error: error,
                status: "Internal Server Error",
                status_code: 500,
                message: "There was an error creating League"
            })

        }

    }


    //League Settings
    async leagueSettings({ request, response, auth }) {

        try {
            //Current Auth User          
            let user = auth.current.user

            //Validate Request
            let { league_type, league_start_week, league_end_week, league_paid, amount, league_winner_type, league_id } = request.all()

            //Check and Fetch League            
            let getLeague = await League.query().where('user_id', user.id).andWhere('id', league_id).first()

            //Save
            getLeague.league_type = league_type
            getLeague.league_start_week = league_start_week
            getLeague.league_end_week = league_end_week
            getLeague.league_paid = league_paid
            getLeague.amount = amount
            getLeague.league_winner_type = league_winner_type
            await getLeague.save();

            return response.status(200).json({
                result: getLeague,
                label: `League Creation`,
                statusCode: 200,
                message: `League ${getLeague.league_name} has been updated`,
            })

        } catch (error) {
            console.log(error)
            return response.status(500).json({
                error: error,
                status: "Internal Server Error",
                status_code: 500,
                message: "There was an error updating League Settings"
            })

        }

    }


    //League Weeks
    async leagueWeeks({ response, auth }) {

        try {
            let LeagueWeeks = await WeekSeason.all();
            return response.status(200).json({
                result: LeagueWeeks,
                label: `League Weeks`,
                statusCode: 200,
                message: `All LeagueWeeks fetched`,
            })

        } catch (error) {
            console.log(error)
            return response.status(500).json({
                error: error,
                status: "Internal Server Error",
                status_code: 500,
                message: "There was an error fetching League weeks"
            })

        }

    }


}

module.exports = LeagueCreationController