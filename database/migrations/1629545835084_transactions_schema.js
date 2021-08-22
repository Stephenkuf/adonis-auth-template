'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class TransactionsSchema extends Schema {
  up () {
    // this.dropIfExists('transactions')
    this.create('transactions', (table) => {
      table.increments()
      table.integer('user_id').unsigned().references('id').inTable('users')
      table.decimal('amount', 19,4).notNullable().defaultTo(0.00)
      table.string('type', 10).notNullable()
      table.string('reference', 50)
      table.string('details', 255).notNullable()
      table.timestamps()
    })
  }

  down () {
    this.drop('transactions')
  }
}

module.exports = TransactionsSchema
