const mysql = require("mysql");
const usr_info = require("../utils/authentication");
const dbConnection = require('../utils/dbConnection');

const db = dbConnection.createConnection();

function isHeight(height){
    return !isNaN(height) && height > 0;
}

function isWeight(weight){
    return !isNaN(weight) && weight > 0;
}

const currentMonth = new Date().getMonth() + 1;
exports.view = async (req, res) => {
    try {
        const info = usr_info.getInfo();
        const sql_view_members = 'SELECT weight, height, target, evaluation FROM training WHERE member_id = ' + mysql.escape(info['id']) + " ORDER BY time_update DESC LIMIT 1";
        await db.query(sql_view_members, (error, results) => {
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
                        message: "Lấy thông tin luyện tập thành công",
                        data:
                            {
                                weight: results[0].weight,
                                height: results[0].height,
                                target: results[0].target,
                                evaluation: results[0].evaluation
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

exports.updateTraining = async (req, res) => {
    try {
        if (req.body === {} || req.body.height === undefined || req.body.weight === undefined || req.body.target === undefined) {
            return res.json({
                status: 0,
                message: "Thông tin bắt buộc!"
            });
        }
        else if (req.body.height === "" || req.body.weight === "" || req.body.target === "") {
            return res.json({
                status: 0,
                message: "Thông tin bắt buộc!"
            });
        }
        else if (!isHeight(req.body.height)) {
            return res.json({
                status: 0,
                message: "Wrong height format!"
            })
        }
        else if (!isWeight(req.body.weight)) {
            return res.json({
                status: 0,
                message: "Wrong weight format!"
            })
        }
        else {
            const info = usr_info.getInfo();
            const id = info['id'];
            const { height, weight, target } = req.body;

            const sql_check_if_exist_record = "SELECT * FROM training WHERE member_id = " + mysql.escape(id) + " AND month(time_update) = " + mysql.escape(currentMonth);
            await db.query(sql_check_if_exist_record, async (error, results) => {
                if (error) {
                    console.log(error);
                    return res.json({
                        error: "Unknown error"
                    });
                }
                if (results.length === 0) {
                    const sql_insert_training_info = "INSERT INTO training(member_id, height, weight, target, time_update) VALUES (" + mysql.escape(id) + ", " + mysql.escape(height) + ", " + mysql.escape(weight) + ", " + mysql.escape(target) + ", " + mysql.escape(new Date()) + ")";
                    await db.query(sql_insert_training_info, (error) => {
                        if (error) {
                            console.log(error);
                            return res.json({
                                error: "Unknown error"
                            });
                        }
                        return res.json({
                            status: 1,
                            message: "Cập nhật thông tin tập luyện thành công!"
                        });
                    })
                }
                else {
                    const sql_edit_member = 'UPDATE training SET height = ' + mysql.escape(height) + ', weight = ' + mysql.escape(weight) + ', target = ' + mysql.escape(target) + ' WHERE member_id = ' + mysql.escape(id) + " AND month(time_update) = " + mysql.escape(currentMonth);
                    await db.query(sql_edit_member, (error) => {
                        if (error) {
                            console.log(error);
                            return res.json({
                                error: "Unknown error"
                            });
                        }
                        else {
                            console.log("Cập nhật thông tin tập luyện thành công!");
                            return res.json({
                                status: 1,
                                message: "Cập nhật thông tin tập luyện thành công!"
                            });
                        }
                    });
                }
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


exports.adminViewMember = async (req, res) => {
    try {
        info = {
            id: req.params.id
        };
        const sql_view_members = 'SELECT weight, height, target, evaluation FROM training WHERE member_id = ' + mysql.escape(info['id']) + " ORDER BY time_update DESC LIMIT 1";
        await db.query(sql_view_members, (error, results) => {
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
                        message: "Lấy thông tin luyện tập thành công",
                        data:
                            {
                                weight: results[0].weight,
                                height: results[0].height,
                                target: results[0].target,
                                evaluation: results[0].evaluation
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