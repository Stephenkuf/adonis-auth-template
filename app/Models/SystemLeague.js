'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class SystemLeague extends Model {
  static get hidden () {
      return ['created_at', 'updated_at']
    }
    country () {
        return this.belongsTo('App/Models/Country')
      }
    
}

module.exports = SystemLeague
