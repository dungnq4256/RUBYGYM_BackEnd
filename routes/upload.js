const express = require("express");
const authentication = require("../utils/authentication");
const upload = require("../utils/multer");
const UploadFile = require("../controllers/upload");
const router = express.Router();

router.post('/image', authentication.authenticateToken, upload.single("image"), function (req, res, next) {
    if (req.checkWrongFileType) {
        return res.json({
            status: 0,
            message: "Wrong file format!"
        });
    }
    else next();
}, UploadFile.UploadImage);

module.exports = router;