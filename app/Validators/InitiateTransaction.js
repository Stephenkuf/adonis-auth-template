"use strict";

class InitiateTransaction {
  get validateAll() {
    return true;
  }
  get rules() {
    return {
      amount : "required",
      email: "required|email",
    };
  }

  get messages() {
    return {
      "amount.required": "Amount is required",
      "email.required": "Email is required",
      "email.email": "Input a valid email address"
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

module.exports = InitiateTransaction;