const express = require("express");
const router = express.Router();
const memberController = require("../controllers/member");
const authentication = require("../utils/authentication");
const trainingManagement = require("../controllers/training_management");
const Schedule = require("../controllers/schedule");

router.get('/profile',authentication.authenticateToken, memberController.view);
router.put('/profile',authentication.authenticateToken, memberController.edit);
// training management
router.get('/training', authentication.authenticateToken, trainingManagement.view);
router.post('/training', authentication.authenticateToken, trainingManagement.updateTraining);

router.get("/schedules", authentication.authenticateToken, Schedule.ShowMemberSchedule);
router.get("/schedules/details", authentication.authenticateToken, Schedule.ShowDetailMemberSchedule);

module.exports = router;