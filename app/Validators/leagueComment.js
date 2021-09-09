'use strict'

class leagueComment {
  get rules() {
      return {
          league_id: 'required',
          team_id: 'required',
          comment: 'required',
      }
  }

  get messages() {
      return {
          'league_id.required': 'The League ID is required.',
          'team_id.required': 'The Team ID is required.',
          'comment.required': 'The Comment is required.',
      }
  }


  async fails(errorMessages) {
      return this.ctx.response.status(400).json({
          status: "invalid",
          message: "Validation Error",
          status_code: 400,
          errorMessages: errorMessages[0].message,
      });
  }
}

module.exports = leagueComment
