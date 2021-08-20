'use strict'


require('./apiAuthRoutes.js');
// require("./authRoutes.js");
/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URLs and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.get('/', () => {
  return { greeting: 'Hello world in JSON'}
})

// metadata routes
Route.get("/getMetadata", "Metadata/MetadatumController.getMetadata");
Route.get("/signupTeamList","Metadata/MetadatumController.getSignUpTeamList")
Route.get("/playersList","Metadata/MetadatumController.getAllPlayers")
Route.get("/weekFixtures","Metadata/MetadatumController.getWeekFixtures")

// team selection routes , select team members , remove team members , add team member(s) , view User team  , 
Route.post("/createTeam", "TeamCreation/TeamManagementController.createTeam").middleware(['auth'])
Route.put("/editTeam", "TeamCreation/TeamManagementController.editTeam").middleware(['auth'])
Route.get("/viewUserTeam","TeamCreation/TeamManagementController.viewUserTeam").middleware(['auth'])
Route.get("/viewUserProfile","TeamCreation/TeamManagementController.viewUserProfile").middleware(['auth'])

Route.get("/updateRankings","Metadata/MetadatumController.updateRanking").middleware(['auth'])
Route.get("/viewSquadRankings","Ranking/RankingController.viewSquadRankings").middleware(['auth'])
Route.get("/userTeamRanking","Ranking/RankingController.userTeamRankings").middleware(['auth'])

/**
 * Payment routes fro each payment gateway
 */

//paystack
Route.get("/payment/paystack/get_banks","Payment/PaystackPaymentController.getBanks"); //no authentication needed for this
Route.post("/payment/paystack/initiate_card_transaction","Payment/PaystackPaymentController.initiateCardTransaction").middleware(['auth']).validator("InitiateTransaction");
Route.get("/payment/paystack/resolve_account_number","Payment/PaystackPaymentController.resolveAccountNumber").middleware(['auth']).validator("ResolveAccount");
Route.post("/payment/paystack/verify_transaction","Payment/PaystackPaymentController.verifyPayment").middleware(['auth']).validator("ValidateTransaction");

//stripe

//not currently in use for now
Route.get("/wallet_page","Transaction/TransactionController.walletPageData").middleware(['auth'])


