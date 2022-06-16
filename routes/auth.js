const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const authentication = require("../utils/authentication");
const Schedule = require("../controllers/schedule");

// load the register function in controllers to deal with data
// router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/password', authentication.authenticateToken, authController.changePassword);
router.post('/logout', authentication.authenticateToken, authController.logout);
router.post('/newToken', authController.newToken);

router.get('/admin/events/:id/detail', (req, res) => {
    console.log(req.params.id);
})

module.exports = router;