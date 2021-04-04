'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class LeaguesSchema extends Schema {
  up () {
    this.create('leagues', (table) => {
      table.increments()
      table.integer("player_id")
      table.integer("week_id")
      table.integer("season_id")
      table.integer("points_total")
      table.timestamps()
    })
  }

  down () {
    this.drop('leagues')
  }
}

module.exports = LeaguesSchema
