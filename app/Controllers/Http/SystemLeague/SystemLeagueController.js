'use strict'

const Config = use("Config");
const League = use("App/Models/League");
const WeekSeason = use("App/Models/WeekSeason");
const randomString = require("randomstring");
const Database = use('Database')
const SystemLeagues = use("App/Models/SystemLeague");
const makeExternalRequestFeature = use("App/Features/MakeExternalRequestFeature");

class SystemLeagueController {


    async getSystemCountries({
        request,
        response,
        auth
    }) {
        try {
            const baseUrl = Config.get("rapidApi.getCountries")
            const responseFromApi = await new makeExternalRequestFeature({
                endpoint: `${baseUrl}`
            }).makeGetRequest()

            return response.status(200).json({
                result: responseFromApi,
                label: `Gotten Creation`,
                statusCode: 200,
                message: `Fetched`,
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

    async getLeagueByCountryName({
        params,
        response,
        auth
    }) {
        try {
            //Get country name
            let countryName = params.country_name
            console.log(countryName)
            const baseUrl = Config.get("rapidApi.getLeagueByCountryName")
            const responseFromApi = await new makeExternalRequestFeature({
                endpoint: `${baseUrl}?country=${countryName}`
            }).makeGetRequest()

            return response.status(200).json({
                result: responseFromApi,
                label: `Gotten Creation`,
                statusCode: 200,
                message: `Fetched`,
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


    async getLeagueFixturesBetweenTwoDates({
        params,
        response,
        auth
    }) {
        try {
            //Get country name
            let data = params
            const baseUrl = Config.get("rapidApi.getLeagueFixturesBetweenTwoDates")
            const responseFromApi = await new makeExternalRequestFeature({
                endpoint: `${baseUrl}?league=${data.league}&season=${data.season}&from=${data.from}&to=${data.to}`
            }).makeGetRequest()
            const arr = responseFromApi.results.response
            let fixturesID = arr.map(arr => arr.fixture.id)
            return response.status(200).json({
                result: fixturesID,
                label: `Gotten Creation`,
                statusCode: 200,
                message: `Fetched`,
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


    async test({
        request,
        response,
        auth
    }) {
        try {
            const baseUrl = Config.get("rapidApi.getTeamsByLeagueIdEndpoint")
            const responseFromApi = await new makeExternalRequestFeature({
                endpoint: `${baseUrl}/2`
            }).makeGetRequest()

            return response.status(200).json({
                result: responseFromApi,
                label: `Gotten Creation`,
                statusCode: 200,
                message: `Fetched`,
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

    //Get All System Leagues
    async getAllSystemLeagues({
        request,
        response,
        auth
    }) {
        try {
            //Get League          
            let getAllSystemLeagues = await SystemLeagues.query().with('country').orderBy('league_name', 'ASC').fetch()

            return response.status(200).json({
                result: getAllSystemLeagues,
                label: `All System League`,
                statusCode: 200,
                message: `System League Fetched`,
            })

        } catch (error) {
            console.log(error)
            return response.status(500).json({
                error: error,
                status: "Internal Server Error",
                status_code: 500,
                message: "There was an error fetching system leagues"
            })
        }
    }

}

module.exports = SystemLeagueController