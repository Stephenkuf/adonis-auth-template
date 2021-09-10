'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class LeagueCommentSchema extends Schema {
  up () {
    this.create('league_comments', (table) => {
      table.increments()
      table.integer("league_id").unsigned().references('id').inTable('leagues')
      table.integer('user_id').unsigned().references('id').inTable('users')
      table.integer('team_id').unsigned().references('id').inTable('team_squads')
      table.text('comment')
      table.datetime('date')
      table.timestamps()
    })
  }

  down () {
    this.drop('league_comments')
  }
}

module.exports = LeagueCommentSchema
