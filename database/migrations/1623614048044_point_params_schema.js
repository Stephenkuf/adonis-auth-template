'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class PointParamsSchema extends Schema {
  up () {
    this.create('point_params', (table) => {
      table.increments()
      table.string("param_type")
      table.string("player_type")
      table.integer("points").default(0)
      table.timestamps()
    })
  }

  down () {
    this.drop('point_params')
  }
}

module.exports = PointParamsSchema
