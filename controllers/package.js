const mysql = require("mysql");
const usr_info = require("../utils/authentication");
const dbConnection = require('../utils/dbConnection');

const db = dbConnection.createConnection();

let renewPackage = async(req, res) => {
    try {
        // console.log('try');
        const {package_id} = req.body;
        const {id} = req.params;
        const info = usr_info.getInfo();
        const role = info['role'];
        if(role !== "admin"){
            return res.json({
                status: 0,
                message: "Access denied!"
            });
        } else if(package_id === undefined) {
            return res.json({
                status: 0,
                message: "Required Information!"
            });
        } else {
            const sql = 'SELECT expired_at, trained_month FROM member WHERE id = ' + mysql.escape(id);
            await db.query(sql, (error, results) => {
                if(error){
                    console.log(error);
                    return res.json({
                        error: "Unknown error"
                    });
                }
                let bonusMonth;
                const today = Date.now();
                let expired_at = new Date(results[0].expired_at);
                let trained_month = results[0].trained_month;
                // console.log('haiz');

                if (package_id == 3){
                    // console.log('hi');
                    if (trained_month > 12) bonusMonth = 15;
                    else bonusMonth = 12;
                    trained_month += bonusMonth;
                    expired_at = new Date(Math.max(today, expired_at.getTime()));
                    expired_at.setMonth(expired_at.getMonth() + bonusMonth);
                    console.log(expired_at);
                    const sql1 = 'UPDATE member SET expired_at = ' + mysql.escape(expired_at) + ', trained_month = ' + mysql.escape(trained_month) + ' WHERE id = ' + mysql.escape(id);
                    db.query(sql1, (error) => {
                        if(error){
                            console.log(error)
                        }
                    })
                } else {
                    expired_at = new Date(Math.max(today, expired_at.getTime()));
                    // bonusMonth = package_id * 3;
                    if (package_id == 1) bonusMonth = 3;
                    else if (package_id == 2) bonusMonth = 6;

                    trained_month += bonusMonth;

                    // if(trained_month > 12){
                    //     trained_month -=12;
                    //     bonusMonth += 3;
                    // }
                    expired_at.setMonth(expired_at.getMonth() + bonusMonth);
                    const sql1 = 'UPDATE member SET expired_at = ' + mysql.escape(expired_at) + ', trained_month = ' + mysql.escape(trained_month)
                        + ' WHERE id = ' + mysql.escape(id);
                    db.query(sql1, (error) => {
                        if(error){
                            console.log(error);
                            return res.json({
                                error: "Unknown error"
                            });
                        }
                    });
                }
            });
            return res.json({
                status: 1,
                message: "Cập nhật gói tập thành công!"
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

let listPackage = async(req, res) => {
    try {
        const sql = `SELECT * FROM package`;
        db.query(sql, (error, results) => {
            if(error){
                console.log(error);
                return res.json({
                    error: "Unknown error"
                });
            }
            const list = [];
            for(i of results){
                list.push(i);
            }

            return res.json({
                status: 1,
                message: "Lấy danh sách gói tập thành công!",
                data: {
                    "package_list": list
                }
            });
        });
    }
    catch (error) {
        console.log(error);
        return res.json({
            error: "Unknown error"
        });
    }
}

let updatePackage = async(req, res) => {
    try {
        const {prices} = req.body;

        if(prices == undefined){
            return res.json({
                status: 0,
                message: "Required Information!"
            })
        } else {
            const sql = 'UPDATE package SET price = ' + mysql.escape(prices[0]) + ' WHERE id = 1';
            db.query(sql, (err) => {
                if(err){
                    console.log(err);
                    return res.json({
                        error: "Unknown error"
                    })
                }
            })
            const sql1 = 'UPDATE package SET price = ' + mysql.escape(prices[1]) + ' WHERE id = 2';
            db.query(sql1, (err) => {
                if(err){
                    console.log(err);
                    return res.json({
                        error: "Unknown error"
                    })
                }
            })
            const sql2 = 'UPDATE package SET price = ' + mysql.escape(prices[2]) + ' WHERE id = 3';
            db.query(sql2, (err) => {
                if(err){
                    console.log(err);
                    return res.json({
                        error: "Unknown error"
                    })
                }
            })

            return res.json({
                status: 1,
                message: "Cập nhật gói tập thành công!"
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

module.exports = {
    renewPackage,
    listPackage,
    updatePackage
}