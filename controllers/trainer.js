const mysql = require("mysql");
const checkValidPhone = require("../utils/phoneValidation")
const usr_info = require("../utils/authentication");
const dbConnection = require('../utils/dbConnection');

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
    else return 0;
}

exports.view = async (req, res) => {
    try {
        const info = usr_info.getInfo();
        const phone = info['phone'];

        const sql_view_trainer = 'SELECT * FROM trainer WHERE phone = ' + mysql.escape(phone);
        await db.query(sql_view_trainer, (error, results) => {
            if (error) {
                console.log(error);
                return res.json({
                    error: "Unknown error"
                });
            }
            else {
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
                            role: 'trainer',
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

        else if (req.body.name === "" || req.body.birthday === "" || req.body.gender === "" && req.body.address === "") {
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

            const { name, phone, birthday, gender, address } = req.body;

            const sql_edit_trainer = 'UPDATE trainer SET name = ' + mysql.escape(name) + ', phone = ' + mysql.escape(phone) + ', birthday = ' + mysql.escape(birthday.substring(0,10)) +  ', gender = ' + mysql.escape(gender) + ', address = ' + mysql.escape(address) + ' WHERE id = ' + mysql.escape(info['id']);
            await db.query(sql_edit_trainer, (error) => {
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

exports.evaluate = async (req, res) => {
    try {
        const {id} = req.params;
        const {height, weight, target, evaluation} = req.body;
        const currentMonth = new Date().getMonth() + 1;

        const sql_check_if_not_existed = "SELECT * FROM training WHERE member_id = " + mysql.escape(id) + " AND month(time_update) = " + currentMonth;
        await db.query(sql_check_if_not_existed, async (error, results) => {
            if (error) {
                console.log(error);
                return res.json({
                    error: "Unknown error"
                });
            }
            if (results.length === 0) {
                const sql_add_training_info = "INSERT INTO training(member_id, time_update, evaluation, height, weight, target) VALUES (" + mysql.escape(id) + ", " + mysql.escape(new Date()) + ", " + mysql.escape(evaluation) + ", " + mysql.escape(height) + ", " + mysql.escape(weight) + ", " + mysql.escape(target) + ")";
                await db.query(sql_add_training_info, (error) => {
                    if (error) {
                        console.log(error);
                        return res.json({
                            error: "Unknown error"
                        });
                    }
                    return res.json({
                        status: 1,
                        message: "Đánh giá thành công!"
                    });
                })
            }
            else {
                const sql_update_evaluation = "UPDATE training SET evaluation = " + mysql.escape(evaluation) + " WHERE member_id = " + mysql.escape(id) + " AND month(time_update) = " + mysql.escape(currentMonth);
                await db.query(sql_update_evaluation, (error) => {
                    if (error) {
                        console.log(error);
                        return res.json({
                            error: "Unknown error"
                        });
                    }
                    return res.json({
                        status: 1,
                        message: "Đánh giá thành công!"
                    });
                });

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

exports.memberList = async (req, res) => {
    try {
        const id = usr_info.getInfo()['id'];

        const sql_check_if_not_existed = "SELECT * FROM member WHERE trainer_id = " + mysql.escape(id);
        console.log(sql_check_if_not_existed);
        await db.query(sql_check_if_not_existed, async (error, results) => {
            if (error) {
                console.log(error);
                return res.json({
                    status: 0,
                    error: "Unknown error"
                });
            }
            
            if (!results.length) {
                return res.json({
                    status: 0,
                    message: 'Empty!'
                })
            }

            else return res.json({
                status: 1,
                message: 'Lấy danh sách hội viên thành công!',
                data: {
                    member_list: results
                }
            })

        });
    }
    catch (error) {
        console.log(error);
        return res.json({
            error: "Unknown error"
        });
    }
}

exports.viewMemberTrainingInfor = async (req, res) => {
    try {
        const id = req.params.id;

        const sql_check_if_not_existed = "SELECT * FROM training WHERE member_id = " + mysql.escape(id) + ' ORDER BY time_update DESC';
        console.log(sql_check_if_not_existed);
        await db.query(sql_check_if_not_existed, async (error, results) => {
            if (error) {
                console.log(error);
                return res.json({
                    status: 0,
                    error: "Unknown error"
                });
            }
            
            if (!results.length) {
                return res.json({
                    status: 0,
                    message: 'Empty!'
                })
            }

            else return res.json({
                status: 1,
                message: 'Lấy thông tin tập luyện hội viên thành công!',
                data: {
                    member_training_information: results[0]
                }
            })

        });
    }
    catch (error) {
        console.log(error);
        return res.json({
            error: "Unknown error"
        });
    }
}