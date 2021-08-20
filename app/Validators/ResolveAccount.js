"use strict";

class ResolveAccount {
  get validateAll() {
    return true;
  }
  get rules() {
    return {
      account_number : "required",
      bank_code : "required",
    };
  }

  get messages() {
    return {
      "account_number.required": "Account number is required",
      "bank_code.required": "Bank code is required",
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

module.exports = ResolveAccount;