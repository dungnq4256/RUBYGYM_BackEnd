const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const checkValidPhone = require("../utils/phoneValidation")
const usr_info = require("../utils/authentication");
const dbConnection = require("../utils/dbConnection")
const mysql = require("mysql");
const refreshTokens = {}; // this object will store refresh tokens
const db = dbConnection.createConnection();

exports.login = async (req, res) => {
    try {
        if (req.body === {} || req.body.phone === undefined || req.body.password === undefined || req.body.role === undefined) {
            return res.json({
                status: 0,
                message: "Information required!"
            });
        }

        else if (req.body.phone === "" || req.body.password === "" || req.body.role === "") {
            return res.json({
                status: 0,
                message: "Information required!"
            });
        }

        // validate phone number
        else if (!checkValidPhone.isPhoneNumber(req.body.phone)) {
            return res.json({
                status: 0,
                message: "Invalid phone number!"
            });
        }

        else {
            const { role, phone, password } = req.body;
            if (role !== "admin" && role !== "trainer" && role !== "member") {
                return res.json({
                    status: 0,
                    message: "Invalid role"
                });
            }
            const sql_check_pass = "SELECT password, id, name, active, avatar_url FROM " + role + " WHERE phone = " + mysql.escape(phone);
            await db.query(sql_check_pass, async (error, results) => {
                if (error) {
                    console.log(error);
                    return res.json({
                        error: "Unknown error"
                    });
                }

                if (results.length === 0) {
                    return res.json({
                        status: 0,
                        message: "Account does not exist!"
                    });
                }

                if (role !== 'admin' && results[0].active === 0) {
                    return res.json({
                        status: 0,
                        message: "Account is inactive!"
                    });
                }

                const hashedPassword = results[0].password;
                const verified = bcrypt.compareSync(password, hashedPassword);

                if (verified)
                {
                    // send access_token to user
                    const accessToken = jwt.sign(
                        { id: results[0].id, phone: phone, role: role },
                        process.env.ACCESS_TOKEN_SECRET,
                        { expiresIn: 60*60 }
                    )

                    const refreshToken = jwt.sign(
                        { phone: phone },
                        process.env["REFRESH_TOKEN_SECRET"],
                        { expiresIn: 10*60 }
                    )

                    const sql_update_rf_token = "UPDATE " + role + " SET refresh_token = " + mysql.escape(refreshToken) + " WHERE phone = " + mysql.escape(phone);
                    await db.query(sql_update_rf_token, (error) => {
                       if (error) {
                           console.log(error);
                           return res.json({
                               error: "Unknown error"
                           });
                       }
                    });

                    refreshTokens[refreshToken] = {
                        phone: phone,
                        role: role,
                        refreshToken: refreshToken,
                        accessToken: accessToken
                    };

                    return res.json({
                        status: 1,
                        message: "Log in successfully!",
                        data:
                            {
                                access_token: accessToken,
                                role: role,
                                name: results[0].name,
                                avatar_url: results[0].avatar_url
                            }
                    });
                }
                else {
                    return res.json({
                        status: 0,
                        message: "Wrong password!"
                    });
                }
            });
        }
    }
    catch (error) {
        console.log(error);
        return res.json({
            error: "Unknown error"
        });
    }
}

exports.logout = (req, res) => {
    try {
        return res.json({
            status: 1,
            message: "Log out successfully!"
        });
    }
    catch (error) {
        console.log(error);
        return res.json({
            error: "Unknown error"
        });
    }
}

exports.newToken = (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (refreshToken && (refreshToken in refreshTokens)) {
            // get user's payload in jwt
            const jwt_info = refreshTokens[refreshToken];
            // create new access token
            const accessToken = jwt.sign(
                { phone: jwt_info['phone'], role: jwt_info['role'] },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: 60 }
            )

            // update new token
            refreshToken[refreshToken] = {
                phone: jwt_info['phone'],
                role: jwt_info['role'],
                refreshToken: refreshToken,
                accessToken: accessToken
            }
            return res.json({
                new_token: accessToken
            })
        }
        else {
            return res.json({
                message: "Invalid refresh token!"
            })
        }
    }
    catch (error) {
        console.log(error);
        return res.json({
            error: "Unknown error"
        });
    }
}

exports.changePassword = async (req, res) => {
    try {
        const { old_password, new_password } = req.body;
        const info = usr_info.getInfo();

        if (old_password === undefined || new_password === undefined) {
            return res.json({
                status: 0,
                message: "Required information!"
            });
        }
        else if (old_password === "" || new_password === "") {
            return res.json({
                status: 0,
                message: "Required information!"
            });
        }

        else {
            const sql_check_pass = "SELECT password FROM " + info['role'] + " WHERE phone = " + mysql.escape(info['phone']);
            await db.query(sql_check_pass, async (error, results) => {
                if (error) {
                    console.log(error);
                    return res.json({
                        error: "Unknown error"
                    });
                }

                const oldHashedPassword = results[0].password;

                const verified = await bcrypt.compareSync(old_password, oldHashedPassword);

                if (verified) {
                    let newHashedPassword = bcrypt.hashSync(new_password, 8);

                    const sql_update_pass = "UPDATE " + info['role'] + " SET password = " + mysql.escape(newHashedPassword) + " WHERE phone = " + mysql.escape(info['phone']);
                    await db.query(sql_update_pass, (error) => {
                        if (error) {
                            console.log(error);
                            return res.json({
                                error: "Unknown error"
                            });
                        }
                        return res.json( {
                            status: 1,
                            message: "Change password successfully!"
                        });
                    });
                }
                else {
                    return res.json({
                        status: 0,
                        message: "Wrong password",
                    });
                }

            });
        }
    }
    catch (error) {
        console.log(error);
        return res.json({
            error: "Unknown error"
        });
    }
}
