"use strict";

class ValidateTransaction {
  get validateAll() {
    return true;
  }
  get rules() {
    return {
      reference: "required",
      save_card: "required",
    };
  }

  get messages() {
    return {
      "reference.required": "Transaction reference is required",
      "save_card.required": "Save card status is invalid"
    };
  }

  async fails(errorMessages) {
    return this.ctx.response.status(400).json({
      status: "error",
      status_code: 400, 
      message: errorMessages[0].message,
    });
  }
}

module.exports = ValidateTransaction;