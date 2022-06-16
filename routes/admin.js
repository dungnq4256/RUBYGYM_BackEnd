const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin");
const trainingController = require("../controllers/training_management");
const Schedule = require("../controllers/schedule");
const authentication = require("../utils/authentication");
const Package = require("../controllers/package");

// admin
router.get('/profile',authentication.authenticateToken,adminController.view);
router.put('/profile',authentication.authenticateToken,adminController.edit);
// trainer
router.post('/trainers',authentication.authenticateToken,adminController.createTrainer);
router.get('/trainers',authentication.authenticateToken,adminController.viewTrainer);
router.put('/trainers',authentication.authenticateToken,adminController.editTrainer);
router.put('/trainers/:id/delete',authentication.authenticateToken,adminController.deleteTrainer);
router.put('/trainers/:id/restore',authentication.authenticateToken,adminController.restoreTrainer);
router.get('/trainers/list',authentication.authenticateToken,adminController.listTrainer);
router.get("/trainers/:id/members", authentication.authenticateToken, adminController.viewMemberListOfTrainer);
router.get("/trainers/schedules", authentication.authenticateToken, Schedule.ShowAdminScheduleTrainer);
router.get("/trainers/schedules/details", authentication.authenticateToken, Schedule.ShowDetailAdminScheduleTrainer);


// member
router.post('/members',authentication.authenticateToken,adminController.createMember);
router.get('/members',authentication.authenticateToken,adminController.viewMemberDetail);
router.get('/members/:id/training',authentication.authenticateToken,trainingController.adminViewMember);
router.put('/members',authentication.authenticateToken,adminController.updateMember);
router.put('/members/:id/delete',authentication.authenticateToken,adminController.deleteMember);
router.put('/members/:id/restore',authentication.authenticateToken,adminController.restoreMember);
router.get('/members/list',authentication.authenticateToken,adminController.viewMemberList);
// router.put('/members/package', authentication.authenticateToken, adminController.renewPackage);
router.put('/members/:id/trainers', authentication.authenticateToken, adminController.changeTrainer);
router.get("/members/schedules", authentication.authenticateToken, Schedule.ShowAdminScheduleMember);
router.get("/members/schedules/details", authentication.authenticateToken, Schedule.ShowDetailAdminScheduleMember);
// event
router.post("/events",authentication.authenticateToken,adminController.createEvent);
router.get("/events",adminController.viewEventList);
router.get("/events/:id",adminController.viewEventDetail);
router.put("/events/:id",authentication.authenticateToken,adminController.changeEvent);
router.delete("/events/:id",authentication.authenticateToken,adminController.deleteEvent);
// package
router.post('/members/:id/package', authentication.authenticateToken, Package.renewPackage);
router.get('/packages', Package.listPackage);
router.put('/packages', authentication.authenticateToken, Package.updatePackage);
// view all schedules
router.get('/schedules', authentication.authenticateToken, adminController.viewAllSchedules);
module.exports = router;