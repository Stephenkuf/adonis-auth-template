'use strict'

/*
|--------------------------------------------------------------------------
| SystemLeagueSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')
const Database = use('Database')
let system_leagues = [
  {
    country_id: 1,
    league_id: 39,
    league_name: "Premier League",
    league_logo: "https://media.api-sports.io/football/leagues/39.png",
  },
  {
    country_id: 2,
    league_id: 61,
    league_name: "Ligue 1",
    league_logo: "https://media.api-sports.io/football/leagues/61.png",
  },
  {
    country_id: 3,
    league_id: 39,
    league_name: "Bundesliga 1",
    league_logo: "https://media.api-sports.io/football/leagues/78.png",
  },
  {
    country_id: 4,
    league_id: 135,
    league_name: "Serie A",
    league_logo: "https://media.api-sports.io/football/leagues/135.png",
  },
  {
    country_id: 5,
    league_id: 140,
    league_name: "Primera Division",
    league_logo: "https://media.api-sports.io/football/leagues/140.png",
  },
  {
    country_id: 6,
    league_id: 88,
    league_name: "Eredivisie",
    league_logo: "https://media.api-sports.io/football/leagues/88.png",
  },
  {
    country_id: 7,
    league_id: 180,
    league_name: "Championship",
    league_logo: "https://media.api-sports.io/football/leagues/180.png",
  },
  {
    country_id: 8,
    league_id: 144,
    league_name: "Jupiler Pro League",
    league_logo: "https://media.api-sports.io/football/leagues/144.png",
  },
  {
    country_id: 9,
    league_id: 235,
    league_name: "Premier League",
    league_logo: "https://media.api-sports.io/football/leagues/235.png",
  },
  {
    country_id: 10,
    league_id: 554,
    league_name: "3. Lig - Group 3",
    league_logo: "https://media.api-sports.io/football/leagues/554.png",
  },
]

class SystemLeagueSeeder {
  async run () {
    await Database.raw("SET FOREIGN_KEY_CHECKS = 0;");
    await Database.truncate("system_leagues");
    await Database.table("system_leagues").insert(system_leagues);
    await Database.raw("SET FOREIGN_KEY_CHECKS = 1;");
  }
}

module.exports = SystemLeagueSeeder
