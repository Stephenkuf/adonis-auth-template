'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class TeamNamesSchema extends Schema {
  up () {
    this.create('team_names', (table) => {
      table.increments()
      table.integer("user_id")
      table.string("team_name")
      table.boolean("is_active").defaultTo(1)
      table.boolean("is_deleted").defaultTo(0)
      table.timestamps()
    })
  }

  down () {
    this.drop('team_names')
  }
}

module.exports = TeamNamesSchema
