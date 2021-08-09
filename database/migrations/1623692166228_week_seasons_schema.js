'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class WeekSeasonsSchema extends Schema {
  up () {
    this.create('week_seasons', (table) => {
      table.increments()
      table.integer("week")
      table.integer("season")
      table.boolean("is_current").defaultTo(1)
      table.timestamps()
    })
  }

  down () {
    this.drop('week_seasons')
  }
}

module.exports = WeekSeasonsSchema
