'use strict'

const Env = use('Env')

module.exports = {
     /*
  |--------------------------------------------------------------------------
  | RapidAPi Endpoints
  |--------------------------------------------------------------------------
  |
  */
  getTeamsByLeagueIdEndpoint:
  "https://api-football-v1.p.rapidapi.com/v2/teams/league",

  getPlayer:
  "https://api-football-v1.p.rapidapi.com/v3/players",

  getFixturePlayers:
  "https://api-football-v1.p.rapidapi.com/v3/fixtures/players",

  getWeekFixturesEndpoint:
  "https://api-football-v1.p.rapidapi.com/v3/fixtures",

  getStatsByFixtures:
  "https://api-football-v1.p.rapidapi.com/v3/fixtures",
}

