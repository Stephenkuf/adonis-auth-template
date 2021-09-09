'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class SystemLeagueSchema extends Schema {
  up () {
    this.create('system_leagues', (table) => {
      table.increments()
      table.integer("country_id").unsigned().references('id').inTable('countries')
      table.integer("league_id").unsigned().references('id').inTable('leagues')
      table.string('league_name')
      table.string('league_logo')
      table.timestamps()
    })
  }

  down () {
    this.drop('system_leagues')
  }
}

module.exports = SystemLeagueSchema
