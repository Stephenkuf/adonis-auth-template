'use strict'

/*
|--------------------------------------------------------------------------
| PointSettingSeeder
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
    param_id: 1,
    points:4
  },
  {
    param_id: 2,
    points:5
  },
  {
    param_id: 3,
    points:6,
  },
  {
    param_id: 4,
    points:6
  },
  {
    param_id: 5,
    points:3
  },
  {
    param_id: 6,
    points:3
  },
  {
    param_id: 7,
    points:3,
  },
  {
    param_id: 8,
    points:3
  },
  {
    param_id: 9,
    points:1
  },
  {
    param_id: 10,
    points:1
  },
  {
    param_id: 11,
    points:4,
  },
  {
    param_id: 12,
    points:4
  },
]


class PointSettingSeeder {
  
  async run () {
    // await Database.raw("SET FOREIGN_KEY_CHECKS = 0;");
    // await Database.truncate("point_settings");
    // await Database.table("point_settings").insert(settings);
    // await Database.raw("SET FOREIGN_KEY_CHECKS = 1;");
  }
}

module.exports = PointSettingSeeder
