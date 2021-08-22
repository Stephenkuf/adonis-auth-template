'use strict'

class LeagueSettings {
    get rules() {
        return {
            league_id: 'required',
            league_type: 'required',
            league_start_week: 'required',
            league_end_week: 'required',
            league_paid: 'required',
            amount: 'required_when:league_paid,Yes',
            league_winner_type: 'required_when:league_paid,Yes',
        }
    }

    get messages() {
        return {
            'league_id.required': 'You must provide the League ID',
            'league_start_week.required': 'You must provide the League Start Date.',
            'league_end_week.required': 'You must provide the League End Date.',
            'amount.required_when': 'You must provide League amount for each paticipant to be paid.',
            'league_paid.required': 'You must specify if the League is paid or not.',
            'league_type.required': 'You must specify if the League is public or private.',
            'league_winner_type.required_when': 'You must specify if the Winner takes all or Top three shares.',
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

module.exports = LeagueSettings