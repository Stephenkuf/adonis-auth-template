'use strict'

const Config = use("Config");
const League = use("App/Models/League");
const WeekSeason = use("App/Models/WeekSeason");
const randomString = require("randomstring");
const Database = use('Database')
const SystemLeagues = use("App/Models/SystemLeague");
const axios = require('axios');
const makeExternalRequestFeature = use("App/Features/MakeExternalRequestFeature");


class LeagueCreationController {

    //League Creation with Name
    async createLeague({
        request,
        response,
        auth
    }) {

        try {
            //Current Auth User          
            let user = auth.current.user

            //Validate Request
            let {
                league_name
            } = request.all()

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
    async leagueSettings({
        request,
        response,
        auth
    }) {

        try {
            //Current Auth User          
            let user = auth.current.user

            //Validate Request
            let {
                league_type,
                league_start_date,
                league_end_date,
                league_paid,
                amount,
                league_winner_type,
                allowed_league_id,
                league_id
            } = request.all()

            let leagueIdArray = [];
            let allowed_league_array = []
            allowed_league_array.push(allowed_league_id)

            allowed_league_array.forEach(function (id) {
                leagueIdArray.push(id);
            });

            //Check and Fetch League
            let getLeague = await League.query().where('user_id', user.id).andWhere('id', league_id).first()

            //If League not exist
            if(!getLeague){
                return response.status(400).json({
                    status: "The League is not found",
                    status_code: 400,
                    message: `The League with ID ${league_id} is not found`
                })
            }

            //Save
            getLeague.league_type = league_type
            getLeague.league_start_date = league_start_date
            getLeague.league_end_date = league_end_date
            getLeague.league_paid = league_paid
            getLeague.amount = amount
            getLeague.allowed_league_id = "[" + leagueIdArray + "]"
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
    async leagueWeeks({
        response,
        auth
    }) {

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

    //League Participant Ranking
    async leagueParticipantRanking({
        response,
        params,
        auth
    }) {

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

            let getLeagueParticipants = await Database.from('league_participants').where({
                league_id: leagueId.league_id
            }).orderBy('user_ranking', 'ASC')
            return response.status(200).json({
                result: getLeagueParticipants,
                label: `League Participants Ranking`,
                statusCode: 200,
                message: `League ${checkLeague.league_name} Participants Ranking`,
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