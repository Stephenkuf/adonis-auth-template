'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class SquadPointsSchema extends Schema {
  up () {
    this.create('squad_points', (table) => {
      table.increments()
      table.integer("squad_id")
      table.integer("week_season_id")
      table.integer("points_total")
      table.timestamps()
    })
  }

  down () {
    this.drop('squad_points')
  }
}

module.exports = SquadPointsSchema
