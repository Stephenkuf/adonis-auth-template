'use strict'

class LeagueCreation {
    get rules() {
        return {
            league_name: 'required|min:3|max:50|unique:leagues'
        }
    }

    get messages() {
        return {
            'league_name.required': 'You must provide a League Name.',
            'league_name.min': 'Your League Name must more than 3 character long.',
            'league_name.unique': 'This League Name is already registered.',
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

module.exports = LeagueCreation