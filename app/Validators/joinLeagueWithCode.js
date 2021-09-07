'use strict'

class joinLeagueWithCode {
  get rules() {
    return {
      team_id: 'required',
      league_code: 'required|min:8|max:8'
    }
  }

  get messages() {
    return {
      'team_id.required': 'You must provide your Team Id.',
      'league_code.required': 'You must provide a League Code.',
      'league_code.min': 'League Code must more be 8 character.',
      'league_code.max': 'League Code must more be 8 character.'
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

module.exports = joinLeagueWithCode