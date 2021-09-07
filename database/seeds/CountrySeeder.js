'use strict'

/*
|--------------------------------------------------------------------------
| CountrySeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')
const Database = use('Database')
  
let countries = [
  {
    name: "England",
    code: "GB",
    flag: "https://media.api-sports.io/flags/gb.svg",
  },
  {
    name: "France",
    code: "FR",
    flag: "https://media.api-sports.io/flags/fr.svg",
  },
  {
    name: "Germany",
    code: "DE",
    flag: "https://media.api-sports.io/flags/de.svg",
  },
  {
    name: "Italy",
    code: "IT",
    flag: "https://media.api-sports.io/flags/it.svg",
  },
  {
    name: "Spain",
    code: "ES",
    flag: "https://media.api-sports.io/flags/es.svg",
  },
  {
    name: "Netherlands",
    code: "NL",
    flag: "https://media.api-sports.io/flags/nl.svg",
  },
  {
    name: "Scotland",
    code: "GB",
    flag: "https://media.api-sports.io/flags/gb.svg",
  },
  {
    name: "Belgium",
    code: "BE",
    flag: "https://media.api-sports.io/flags/be.svg",
  },
  {
    name: "Russia",
    code: "RU",
    flag: "https://media.api-sports.io/flags/ru.svg",
  },
  {
    name: "Turkey",
    code: "TR",
    flag: "https://media.api-sports.io/flags/tr.svg",
  },
]

class CountrySeeder {
  async run () {
    await Database.raw("SET FOREIGN_KEY_CHECKS = 0;");
    await Database.truncate("countries");
    await Database.table("countries").insert(countries);
    await Database.raw("SET FOREIGN_KEY_CHECKS = 1;");  
  }
}

module.exports = CountrySeeder
