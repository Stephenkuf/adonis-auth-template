'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class PrizeSchema extends Schema {
  up () {
    this.create('prizes', (table) => {
      table.increments()
      table.integer("season_id")
      table.integer("week_id")
      table.string("position")
      table.string("prize")
      table.timestamps()
    })
  }

  down () {
    this.drop('prizes')
  }
}

module.exports = PrizeSchema