'use strict'

const Wallet = use("App/Models/Wallet");
const Transaction = use("App/Models/Transaction");




class WalletFeature {

    constructor(data) {
        this.data = data;
    }


    async create(){

        const { user_id } = this.data;
        const wallet_exist = await Wallet.query().where('user_id', user_id).first();

        if( !wallet_exist ) {
            const create_wallet = await Wallet.create({ 'user_id': user_id });
            if( create_wallet ) {
                //send notification if needed
                return { 'status': 'status', 'message': 'wallet created'};
            }
            return { 'status': 'error', 'message': 'wallet creation failed'};
        }
        return { 'status': 'error', 'message': 'wallet already exist for id'};
        
    }

    async debit(){

        const { user_id, amount, description, reference } = this.data;
        
        //prevent double debit
        const transaction_exist = await Transaction.query().where({ 'user_id': user_id, 'reference': reference }).first();
        if( transaction_exist && transaction_exist.reference != null) {
            return { 'status': 'error', 'message': 'duplicate transaction'};
        }

        const current_balance = await Wallet.query().where('user_id', user_id).first();
        
        if ( current_balance.balance >= amount ){
            const new_balance = current_balance.balance - amount;
            const update_balance = await Wallet.query().where('user_id', user_id).update({ 'balance': new_balance });
            const log_transaction = await Transaction.create({ 'user_id': user_id, 'amount': amount, 'type': 'debit', 'reference': reference, 'details': description })
            
            if( update_balance && log_transaction ) {
                //send notification if needed
                return { 'status': 'success', 'message': 'debit successful'};
            }
            return { 'status': 'error', 'message': 'debit failed'};
        }
        return { 'status': 'error', 'message': 'insufficient funds'};

    }

    async credit(){ 

        const { user_id, amount, description, reference } = this.data;

        //prevent double credit
        const transaction_exist = await Transaction.query().where({ 'user_id': user_id, 'reference': reference }).first();
        if( transaction_exist && transaction_exist.reference != null) {
            return { 'status': 'error', 'message': 'duplicate transaction'};
        }

        const current_balance = await Wallet.query().where('user_id', user_id).first();
        const new_balance = current_balance.balance + amount;
        const update_balance = await Wallet.query().where('user_id', user_id).update({ 'balance': new_balance });
        const log_transaction = await Transaction.create({ 'user_id': user_id, 'amount': amount, 'type': 'credit', 'reference': reference, 'details': description })
       
        if( update_balance ) {
            //send notification if needed
            return { 'status': 'success', 'message': 'credit successful'};
        }
        return { 'status': 'error', 'message': 'credit failed'};

    }

    async getBalance(){
        return;
    }

}

module.exports = WalletFeature