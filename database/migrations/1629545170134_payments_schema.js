'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class PaymentsSchema extends Schema {
  up () {
    // this.dropIfExists('payments')
    this.create('payments', (table) => {
      table.increments()
      table.integer('user_id').unsigned().references('id').inTable('users')
      table.string('reference', 50).notNullable()
      table.decimal('amount', 19,4).notNullable().defaultTo(0.00)
      table.string('channel', 50).notNullable()
      table.string('save_card', 50)
      table.string('status', 50).notNullable()
      table.string('gateway_response', 50)
      table.string('source', 50).notNullable()
      table.timestamps()
    })
  }

  down () {
    this.drop('payments')
  }
}

module.exports = PaymentsSchema
