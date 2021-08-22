'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class WalletsSchema extends Schema {
  up () {
    // this.dropIfExists('wallets')
    this.create('wallets', (table) => {
      table.increments()
      table.integer('user_id').unsigned().references('id').inTable('users')
      table.decimal('balance', 19,4).notNullable().defaultTo(0.00)
      table.timestamps()
    })
  }

  down () {
    this.drop('wallets')
  }
}

module.exports = WalletsSchema
