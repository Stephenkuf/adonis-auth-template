'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class PlayerSquadSchema extends Schema {
  up () {
    this.create('player_squads', (table) => {
      table.increments()
      table.integer("player_id")
      table.integer("squad_id")
      table.integer("week_season_id")
      table.string("wing")
      table.boolean("is_captain").defaultTo(0)
      table.boolean("is_substitute").default(0)
      table.string("placement")
      table.integer("points_total")
      table.timestamps()
    })
  }

  down () {
    this.drop('player_squads')
  }
}

module.exports = PlayerSquadSchema
