const mysql = require("mysql");
const usr_info = require("../utils/authentication");
const dbConnection = require('../utils/dbConnection');
const checkValidPhone = require("../utils/phoneValidation");

const db = dbConnection.createConnection();

function isValidDate(dateString) {
    dateString = dateString.substring(0, 10);
    const regEx = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateString.match(regEx)) return false;  // Invalid format
    const d = new Date(dateString);
    const dNum = d.getTime();
    if (!dNum && dNum !== 0) return false; // NaN value, Invalid date
    return d.toISOString().slice(0, 10) === dateString;
}
function isGender(gender) {
    if (gender === "Nam" || gender === "none" || gender === "Nữ") return 1;
    return 0;
}

exports.view = async (req, res) => {
    try {
        const info = usr_info.getInfo();

        const sql_view_members = 'SELECT * FROM member WHERE id = ' + mysql.escape(info['id']);
        await db.query(sql_view_members, (error, results) => {
            if (error) {
                console.log(error);
                return res.json({
                    error: "Unknown error"
                });
            }
            else {
                return res.json({
                    status: 1,
                    message: "Get profile successfully!",
                    data: {
                        role: 'member',
                        name: results[0].name,
                        phone: results[0].phone,
                        birthday: results[0].birthday,
                        gender: results[0].gender,
                        address: results[0].address,
                        created_at: results[0].created_at,
                        expired_at: results[0].expired_at,
                        avatar_url: results[0].avatar_url
                    }
                });
                if (results.length === 0) {
                    return res.json({
                        message: "Empty!"
                    });
                }
                else {
                    return res.json({
                        status: 1,
                        message: "Get profile successfully!",
                        data: {
                            role: 'member',
                            name: results[0].name,
                            phone: results[0].phone,
                            birthday: results[0].birthday,
                            gender: results[0].gender,
                            address: results[0].address,
                            created_at: results[0].created_at,
                            avatar_url: results[0].avatar_url
                        }
                    });
                }
            }
        });
    }
    catch (error) {
        console.log(error);
        return res.json({
            error: "Unknown error"
        });
    }
}

exports.edit = async (req, res) => {
    try {
        if (req.body === {} || req.body.name === undefined || req.body.birthday === undefined || req.body.gender === undefined || req.body.address === undefined) {
            return res.json({
                status: 0,
                message: "Information required!"
            });
        }

        else if (req.body.name === "" || req.body.birthday === "" || req.body.gender === "" || req.body.address === "") {
            return res.json({
                status: 0,
                message: "Information required!"
            });
        }
        else if (!isGender(req.body.gender)) {
            return res.json({
                status: 0,
                message: "Wrong gender format!"
            })
        }
        else if (!isValidDate(req.body.birthday)) {
            return res.json({
                status: 0,
                message: "Wrong date format!"
            })
        }
        else if (!checkValidPhone.isPhoneNumber(req.body.phone)) {
            return res.json({
                status: 0,
                message: "Invalid phone number!"
            });
        }
        else {
            const info = usr_info.getInfo();
            const id = info['id'];
            const { name, phone, birthday, gender, address } = req.body;

            const sql_edit_member = 'UPDATE member SET name = ' + mysql.escape(name) + ', phone = ' + mysql.escape(phone) + ', birthday = ' + mysql.escape(birthday.substring(0,10)) + ', gender = ' + mysql.escape(gender) + ', address = ' + mysql.escape(address) + ' WHERE id = ' + mysql.escape(id);
            await db.query(sql_edit_member, (error) => {
                if (error) {
                    console.log(error);
                    return res.json({
                        error: "Unknown error"
                    });
                }
                else {
                    console.log("Update record successfully!");
                    return res.json({
                        status: 1,
                        message: "Update profile successfully!"
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