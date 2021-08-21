'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CardsSchema extends Schema {
  up () {
    // this.dropIfExists('cards')
    this.create('cards', (table) => {
      table.increments()
      table.integer('user_id').unsigned().references('id').inTable('users')
      table.text('auth_code').notNullable()
      table.string('card_type', 50).notNullable()
      table.string('last4', 4).notNullable()
      table.string('exp_month', 4).notNullable()
      table.string('exp_year', 4).notNullable()
      table.string('bin', 10).notNullable()
      table.string('bank', 255).notNullable()
      table.string('name', 255)
      table.timestamps()
    })
  }

  down () {
    this.drop('cards')
  }
}

module.exports = CardsSchema
