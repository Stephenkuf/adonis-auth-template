'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class LeagueSchema extends Schema {
    up() {
        this.create('leagues', (table) => {
            table.increments()
            table.integer("user_id").notNullable()
            table.string("league_name").notNullable()
            table.string("league_invite_code").notNullable()
            table.text("allowed_league_id").default([])
            table.enu('league_type', ['public', 'private'])
            table.date("league_start_date")
            table.date("league_end_date")
            table.boolean('league_paid')
            table.integer("amount")
            table.enu('league_winner_type', ['winner', 'default'])
            table.enu('league_status', ['not started', 'started', 'ended']).default('not started')
            table.timestamps()
        })
    }

    down() {
        this.drop('leagues')
    }
}

module.exports = LeagueSchema