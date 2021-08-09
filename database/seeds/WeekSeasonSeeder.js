'use strict'

/*
|--------------------------------------------------------------------------
| WeekSeasonSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')
const Database = use("Database");

let settings = [
  {
    week: 1,
    season:1,
    is_current:1,
  },
]

class WeekSeasonSeeder {
  async run () {
    await Database.raw("SET FOREIGN_KEY_CHECKS = 0;");
    await Database.truncate("week_seasons");
    await Database.table("week_seasons").insert(settings);
    await Database.raw("SET FOREIGN_KEY_CHECKS = 1;");
  }
}

module.exports = WeekSeasonSeeder
