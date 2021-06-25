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
