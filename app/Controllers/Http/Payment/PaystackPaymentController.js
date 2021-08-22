'use strict'

// const { first } = require("@adonisjs/lucid/src/Lucid/Model");

const Config = use("Config");
const Card = use("App/Models/Card");
const Payment = use("App/Models/Payment");
const WalletFeature = use("App/Features/WalletFeature");

const Env = use('Env')
const Axios = use('Axios');
// const https = use('https');
var paystack = use("paystack-api")(Env.get('ps_private_key'));


class PaystackPaymentController {


    async getBanks({ response }) {
        try {
            await Axios.get(Env.get('ps_host') + '/bank',
                {
                    headers: {
                        Authorization: 'Bearer '+ Env.get('ps_private_key')
                    }

                }).then(function(res) {
                    if( res.data.status === true ){

                        const banks = [];
                        for( const s of res.data.data ) {
                            var bank = { 'name' : s.name, 'code' : s.code, 'id' : s.id }
                            banks.push(bank)
                        }

                        return response.status(200).json({
                            status : 'success',
                            'status_code' : 200,
                            'message' : 'Banks fetched successfully',
                            'data' : banks
                        })

                    } else {
                        // console.log('error');
                        return response.status(500).json({
                            'status' : 'error',
                            'status_code' : 500,
                            'message' : `We were unable to fetch banks`
                        })
                    }
                });
        } catch (error) {
            console.log(error);
            return response.status(500).json({
                'status' : 'error',
                'status_code' : 500,
                'message' : `We were unable to fetch banks`
            })
        }
    }
    
    async resolveAccountNumber({ request, response }) {    
        const { bank_code, account_number } = request.all();
        try {
            await Axios.get(Env.get('ps_host') + '/bank/resolve?account_number='+account_number+'&bank_code='+bank_code,
                {
                    headers: {
                        Authorization: 'Bearer '+ Env.get('ps_private_key')
                    }

                }).then(function(res) {

                    if( res.data.status === true ){

                        const data = { 'acccount_name' : res.data.data.account_name }
                        return response.status(200).json({
                            status : 'success',
                            'status_code' : 200,
                            'message' : 'Account number resolved',
                            'data' : data
                        })

                    } else {
                        console.log('error');
                        return response.status(500).json({
                            'status' : 'error',
                            'status_code' : 500,
                            'message' : res.data.message
                        })
                    }
                });
        } 
        catch (error) {
            console.log(error);
            return response.status(500).json({
                'status' : 'error',
                'status_code' : 500,
                'message' : `We were unable to resolve acccount number`,
                'error' : error.data
            })
        }
    }

    async initiateCardPayment({ request, response, auth }) {
        try {
            const userObject = await auth.current.user;
            const { amount } = request.all();

            await paystack.transaction
                .initialize({ 'amount': amount, 'email' : userObject.email })
                .then(function(body) {
                    response.status(200).json({
                        status : 'success',
                        'status_code' : 200,
                        'message' : 'Payment initiated successfully',
                        'data' : body.data
                    })
                })
            }
            catch(error) {
                return response.status(500).json({
                    'status' : 'error',
                    'status_code' : 500,
                    'message' : `We were unable to initialte transaction`
                })
            }
    }

    async verifyPayment({ request, response, auth }) {
        try {
            const { reference, save_card } = request.all();
            const userObject = await auth.current.user;
            const check_payment = await Payment.query().where({'user_id': 1, 'reference': reference }).first();
            if( check_payment ) {

                let transaction = { 'status': check_payment.status, 'reference': check_payment.reference, 'amount': check_payment.amount, 'gateway_response': check_payment.gateway_response }
                
                if( check_payment.status == 'success' ){
                    return response.status(200).json({
                        'status' : check_payment.status,
                        'status_code' : 200,
                        'message' : 'Payment successful',
                        'data' : transaction
                    })
                }
                return response.status(200).json({
                    'status' : check_payment.status,
                    'status_code' : 200,
                    'message' : 'Payment unsuccessful',
                    'data' : transaction
                })
            }

            const body = await paystack.transaction.verify( { reference : reference } )

            let data = { 'status' : body.data.status, 'reference': body.data.reference, 'amount': body.data.amount, 'gateway_response': body.data.gateway_response }
                
            var status = 'error'; var message = 'Payment failed';
            if( data.status == 'success' ) {
                var status = 'success'; var message = 'Payment successful';

                //credit wallet
                await new WalletFeature({ 'user_id': userObject.id, 'amount': body.data.amount, 'description': 'paystack-wallet-credit', 'reference': body.data.reference }).credit();

                //save transaction in payment table
                const Payment_data = { 'user_id': userObject.id, 'reference': body.data.reference, 'amount': body.data.amount, 'channel': body.data.channel, 'save_card': save_card, 'status': body.data.status, 'gateway_response': body.data.gateway_response, 'source': 'paystack' }
                await Payment.create( Payment_data )
            }
            
            if( save_card == 'yes' ) {
                //chnage this to the user id od the logged in user later
                let card_data = { 'user_id': userObject.id, 'auth_code': body.data.authorization.authorization_code, 'card_type': body.data.authorization.card_type, 'last4': body.data.authorization.last4, 'exp_month': body.data.authorization.exp_month, 'exp_year': body.data.authorization.exp_year, 'bin': body.data.authorization.bin, 'bank': body.data.authorization.bank, 'name': body.data.authorization.account_name };
                const saved_card = await Card.query().where({'auth_code': card_data.auth_code, 'user_id': card_data.user_id }).first();

                if( !saved_card ) {
                    await Card.create(card_data);
                }
            }

            response.status(200).json({
                'status' : status,
                'status_code' : 200,
                'message' : message,
                'data' : data,
                // 'data1' : body
            })

        }
        catch(error) {
            console.log(error);
            return response.status(500).json({
                'status' : 'error',
                'status_code' : 500,
                'message' : `We were unable to verify this transaction`
            })
        }
    }

    
    // async

    

}

module.exports = PaystackPaymentController