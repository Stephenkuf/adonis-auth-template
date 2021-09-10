'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CountrySchema extends Schema {
  up () {
    this.create('countries', (table) => {
      table.increments()
      table.string('name', 100)
      table.string('code', 100)
      table.string('flag', 100)
      table.timestamps()
    })
  }

  down () {
    this.drop('countries')
  }
}

module.exports = CountrySchema
