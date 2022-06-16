const jwt = require("jsonwebtoken");
const infoList = {};

exports.authenticateToken = (req, res, next) => {
    try {
        let accessToken = req.headers['authorization'].split(' ')[1];

        jwt.verify(accessToken, process.env["ACCESS_TOKEN_SECRET"], (error, payload) => {
            if (error) {
                console.log(error);
                // wrong token
                return res.json({
                    status: 0,
                    message: "Invalid token!"
                });
            } else {
                // console.log(payload.phone);
                infoList['phone'] = payload.phone;
                infoList['role'] = payload.role;
                infoList['id'] = payload.id;
                next();
            }
        })
    }
    catch (err) {
        console.log(err);
        return res.json({
            status: 0,
            message: "Invalid token!"
        });
    }
}

// get email address for password_changing
exports.getInfo = () => {
    return infoList;
}
