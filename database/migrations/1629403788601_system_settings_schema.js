'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class SystemSettingsSchema extends Schema {
  up () {
    this.create('system_settings', (table) => {
      table.increments()
      table.boolean("leave_league_in_between_league").defaultTo(0)
      table.timestamps()
    })
  }

  down () {
    this.drop('system_settings')
  }
}

module.exports = SystemSettingsSchema
