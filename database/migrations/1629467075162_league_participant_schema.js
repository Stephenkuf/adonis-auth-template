'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class LeagueParticipantSchema extends Schema {
    up() {
        this.create('league_participants', (table) => {
            table.increments()
            table.integer('user_id').unsigned().references('id').inTable('users')
            table.integer("league_id").unsigned().references('id').inTable('leagues')
            table.integer("team_id")
            table.integer("user_points")
            table.integer("user_ranking")
            table.boolean("user_status").comment('0 represents when a participant left, while 1 represents the participant is active')
            table.timestamps()
        })
    }

    down() {
        this.drop('league_participants')
    }
}

module.exports = LeagueParticipantSchema