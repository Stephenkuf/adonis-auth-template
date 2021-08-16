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
      table.string("week_start_date")
      table.string("week_end_date")
      table.timestamps()
    })
  }

  down () {
    this.drop('week_seasons')
  }
}

module.exports = WeekSeasonsSchema
