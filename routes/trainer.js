const express = require("express");
const router = express.Router();
const trainerController = require("../controllers/trainer");
const authentication = require("../utils/authentication");
const Schedule = require("../controllers/schedule");
const evaluation = require("../controllers/trainer");

router.get('/profile',authentication.authenticateToken,trainerController.view);
router.put('/profile',authentication.authenticateToken,trainerController.edit)

// schedule
router.get("/schedules", authentication.authenticateToken, Schedule.ShowTrainerSchedule);
router.get("/schedules/details", authentication.authenticateToken, Schedule.ShowDetailTrainerSchedule);
router.post("/schedules", authentication.authenticateToken, Schedule.CheckMatchSchedule, Schedule.CreateSchedule);
router.delete("/schedules/:id", authentication.authenticateToken, Schedule.DeleteSchedule);
router.put("/schedules/:id/note-absent", authentication.authenticateToken, Schedule.NoteAbsent);
// training target
router.post('/members/:id/training', authentication.authenticateToken, evaluation.evaluate);
router.get('/members/:id/training', authentication.authenticateToken, evaluation.viewMemberTrainingInfor);
router.get('/members', authentication.authenticateToken, trainerController.memberList);

module.exports = router;