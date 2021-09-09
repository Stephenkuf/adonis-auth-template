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
    return { greeting: 'Hello world in JSON' }
})

// metadata routes
Route.get("/getMetadata", "Metadata/MetadatumController.getMetadata");
Route.get("/signupTeamList", "Metadata/MetadatumController.getSignUpTeamList")
Route.get("/playersList", "Metadata/MetadatumController.getAllPlayers")
Route.get("/weekFixtures", "Metadata/MetadatumController.getWeekFixtures")

// team selection routes , select team members , remove team members , add team member(s) , view User team  , 
Route.post("/createTeam", "TeamCreation/TeamManagementController.createTeam").middleware(['auth'])
Route.put("/editTeam", "TeamCreation/TeamManagementController.editTeam").middleware(['auth'])
Route.get("/viewUserTeam", "TeamCreation/TeamManagementController.viewUserTeam").middleware(['auth'])
Route.get("/viewUserProfile", "TeamCreation/TeamManagementController.viewUserProfile").middleware(['auth'])

Route.get("/updateRankings", "Metadata/MetadatumController.updateRanking").middleware(['auth'])
Route.get("/viewSquadRankings", "Ranking/RankingController.viewSquadRankings").middleware(['auth'])
Route.get("/userTeamRanking", "Ranking/RankingController.userTeamRankings").middleware(['auth'])


Route.get("/test", "SystemLeague/SystemLeagueController.test")
Route.get("/countries", "SystemLeague/SystemLeagueController.getSystemCountries")
Route.get("/leaguesByCountryName/:country_name", "SystemLeague/SystemLeagueController.getLeagueByCountryName")
Route.get("/getAllSystemLeagues", "SystemLeague/SystemLeagueController.getAllSystemLeagues")
Route.get("/getLeagueFixturesBetweenTwoDates/:league/:season/:from/:to", "SystemLeague/SystemLeagueController.getLeagueFixturesBetweenTwoDates")


//League Creation
Route.post("/createLeague", "League/LeagueCreationController.createLeague").validator("LeagueCreation").middleware(['auth'])
Route.put("/leagueSettings", "League/LeagueCreationController.leagueSettings").validator("LeagueSettings").middleware(['auth'])
// Route.get("/leagueWeeks", "League/LeagueCreationController.leagueWeeks").middleware(['auth'])
Route.get("/leagueParticipantRanking/:league_id", "League/LeagueCreationController.leagueParticipantRanking").middleware(['auth'])

//Join League With Code
Route.post("/joinLeagueWithcode", "League/LeagueSettingController.joinLeagueWithCode").validator("joinLeagueWithCode").middleware(['auth'])

//Join League
Route.get("/joinLeague/:league_id/:team_id", "League/LeagueSettingController.joinLeague").middleware(['auth'])

//Leave League
Route.get("/leaveLeague/:league_id/:team_id", "League/LeagueSettingController.leaveLeague").middleware(['auth'])

//Leave Comment
Route.post("/leagueComment", "League/LeagueSettingController.leagueComment").validator("leagueComment").middleware(['auth'])
Route.get("/leagueComment/:league_id", "League/LeagueSettingController.getLeagueComment").middleware(['auth'])
