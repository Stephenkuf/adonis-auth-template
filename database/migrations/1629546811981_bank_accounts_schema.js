'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class BankAccountsSchema extends Schema {
  up () {
    // this.dropIfExists('bank_accounts')
    this.create('bank_accounts', (table) => {
      table.increments()
      table.integer('user_id').unsigned().references('id').inTable('users')
      table.string('account_number', 10).notNullable()
      table.string('bank_code', 10).notNullable()
      table.string('bank_name', 255).notNullable()
      table.string('account_name', 255).notNullable()
      table.timestamps()
    })
  }

  down () {
    this.drop('bank_accounts')
  }
}

module.exports = BankAccountsSchema
