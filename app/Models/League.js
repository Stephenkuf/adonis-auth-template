'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class League extends Model {
     squad(){
         return this.hasOne("App/Models/TeamSquad","player_squad_id", "id" )
     }
}

module.exports = League
