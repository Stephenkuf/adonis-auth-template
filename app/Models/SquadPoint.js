'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class SquadPoint extends Model {
    squad(){
        return this.hasOne("App/Models/TeamSquad","squad_id", "id" )
    }
}

module.exports = SquadPoint
