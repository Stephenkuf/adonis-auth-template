'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class LeagueParticipantSchema extends Schema {
    up() {
        this.create('league_participants', (table) => {
            table.increments()
            table.integer("user_id").notNullable()
            table.integer("league_id").notNullable()
            table.integer("participant_position")
            table.boolean("participant_status").comment('0 represents when a participant left, while 1 represents the participant is active')
            table.timestamps()
        })
    }

    down() {
        this.drop('league_participants')
    }
}

module.exports = LeagueParticipantSchema