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
    else return 0;
}
// trainer management
exports.view = async (req, res) => {
    try {
        const info = usr_info.getInfo();
        const phone = info['phone'];

        const sql_view_admins = 'SELECT * FROM admin WHERE phone = ' + mysql.escape(phone);
        await db.query(sql_view_admins, (error, results) => {
            if (error) {
                console.log(error);
                return res.json({
                    error: "Unknown error"
				});
            }
            if (results.length === 0) {
                return res.json({
                    status: 0,
                    message: "Empty!"
                });
            }
            else {
                return res.json({
                    status: 1,
                    message: "Get profile successfully!",
                    data: {
                        name: results[0].name,
                        phone: results[0].phone,
                        role: 'admin',
                        birthday: results[0].birthday,
                        gender: results[0].gender,
                        address: results[0].address,
                        created_at: results[0].created_at,
                        avatar_url: results[0].avatar_url
                    }
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
            });
        }
        else if (!isValidDate(req.body.birthday)) {
            return res.json({
                status: 0,
                message: "Wrong date format!"
            });
        }
        else if (!checkValidPhone.isPhoneNumber(req.body.phone)) {
            return res.json({
                status: 0,
                message: "Invalid phone number!"
            });
        }
        else {
            const { name, phone, birthday, gender, address } = req.body;
            const info = usr_info.getInfo();

            const sql_edit_admin = 'UPDATE admin SET name = ' + mysql.escape(name) + ', phone = ' + mysql.escape(phone) + ', birthday = ' + mysql.escape(birthday.substring(0, 10)) + ', gender = ' + mysql.escape(gender) + ', address = ' + mysql.escape(address) + ' WHERE id = ' + mysql.escape(info['id']);
            await db.query(sql_edit_admin, (error) => {
                if (error) {
                    console.log(error);
                    return res.json({
                        error: "Unknown error"
                    });
                }
                else {
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
exports.createTrainer = async (req, res) => {
    try {
        if (req.body === {}
            || req.body.name === undefined 
            || req.body.phone === undefined 
            || req.body.gender === undefined 
            || req.body.address === undefined 
            || req.body.birthday === undefined) {
            return res.json({
                status: 0,
                message: "Required Information!"
            });
        }
        else if (req.body.name === "" 
        || req.body.phone === "" 
        || req.body.gender === "" 
        || req.body.address === ""
        || req.body.birthday === "") {
            return res.json({
                status: 0,
                message: "Required Information!"
            });
        }
        else if (!isGender(req.body.gender)) {
            return res.json({
                status: 0,
                message: "Wrong gender format!"
            });
        }
        else if (!isValidDate(req.body.birthday)) {
            return res.json({
                status: 0,
                message: "Wrong date format!"
            });
        }
        else if (!checkValidPhone.isPhoneNumber(req.body.phone)) {
            return res.json({
                status: 0,
                message: "Invalid phone number!"
            });
        }
        else { //name,phone,password, birthday, gender,address, avatar_url
            const info = usr_info.getInfo();
            const id = info['id'];
            const sql_check_phone = 'SELECT * FROM trainer WHERE phone = ' + mysql.escape(req.body.phone);
            await db.query(sql_check_phone, async (error, results) => {
                if (error) {
                    console.log(error);
                    return res.json({
                        error: "Unknown error"
                    });
                }
                if (results.length !== 0) {
                    return res.json({
                        status: 0,
                        message: "Phone number is already in use!"
                    });
                }
                else {
                    const sql_add_trainer = 'INSERT INTO trainer (name, phone, birthday, gender, address, avatar_url, admin_creator_id, password) Values (' + mysql.escape(req.body.name) + ', ' + mysql.escape(req.body.phone) + ', ' + mysql.escape(req.body.birthday) + ', ' + mysql.escape(req.body.gender) + ', ' + mysql.escape(req.body.address) + ', ' + mysql.escape(req.body.avatar_url) + ', ' + mysql.escape(id) + ", \'$2a$08$Bdf1eMhN9TjlRFy2U32bz.oYnuqlUsPXqxN1aBnf.mhasSmgKhBKy\')";
                    await db.query(sql_add_trainer, (error) => {
                        if (error) {
                            console.log(error);
                            return res.json({
                                error: "Unknown error"
                            });
                        }
                        else {
                            return res.json({
                                status: 1,
                                message: "Add trainer successfully!",
                                data: {
                                    phone: req.body.phone,
                                    password: '123456'
                                }
                            });
                        }
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
exports.viewTrainer = async (req, res) => {
    try {
        const id = req.query.id;

        await db.query("SELECT * FROM trainer WHERE id = ?", [id], (error, results) => {
            if (error) {
                console.log(error);
                return res.json({
                    error: "Unknown error"
                });
            }
            if (results.length === 0) {
                return res.json({
                    status: 0,
                    message: "Empty!"
                });
            }
            else {
                console.log(results);
                return res.json({
                    status: 1,
                    message: "Get profile successfully!",
                    data: {
                        id: results[0].id,
                        name: results[0].name,
                        phone: results[0].phone,
                        birthday: results[0].birthday,
                        gender: results[0].gender,
                        address: results[0].address,
                        created_at: results[0].created_at,
                        avatar_url: results[0].avatar_url
                    }
                })
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
exports.editTrainer = async (req, res) => {
    try {
        const id = req.query.id;
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
        else {
            const { name, birthday, gender, address, avatar_url } = req.body;
            await db.query("UPDATE trainer SET name = ?, birthday = ?, gender = ?, address = ?, avatar_url = ? WHERE id = ?", [name, birthday, gender, address, avatar_url, id], (error) => {
                if (error) {
                    console.log(error);
                    return res.json({
                        error: "Unknown error"
                    });
                }
                else {
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
exports.deleteTrainer = async (req, res) => {
    try {
        const id = req.params.id;

        await db.query("UPDATE trainer SET active = 0 WHERE id = ?;", [id], (error) => {
            if (error) {
                console.log(error);
                return res.json({
                    error: "Unknown error"
                });
            }
            else {
                return res.json({
                    status: 1,
                    message: "Delete trainer successfully!",
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
exports.restoreTrainer = async (req, res) => {
    try {
        const id = req.params.id;

        await db.query("UPDATE trainer SET active = 1 WHERE id = ?;", [id], (error) => {
            if (error) {
                console.log(error);
                return res.json({
                    error: "Unknown error"
                });
            }
            else {
                return res.json({
                    status: 1,
                    message: "Restore trainer successfully!",
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
exports.listTrainer = async (req, res) => {
    try {
        await db.query("select id, name, phone, avatar_url, active from trainer", (error, results) => {
            if (error) {
                console.log(error);
                return res.json({
                    error: "Unknown error"
                });
            }
            if (results.length > 0) {
                let trainerList = [];
                for (let trainer of results) {
                    trainerList.push(trainer);
                }
                return res.json({
                    status: 1,
                    message: "Get trainer list successfully!",
                    data: {
                        trainer_list: trainerList
                    }
                });
            }
            else {
                return res.json({
                    status: 0,
                    message: "Empty!"
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
// member management
exports.createMember = async (req, res) => {
    try {
        if (req.body === {} 
            || req.body.name === undefined 
            || req.body.phone === undefined 
            || req.body.birthday === undefined
            || req.body.gender === undefined 
            || req.body.address === undefined) {
            return res.json({
                status: 0,
                message: "Required Information!"
            });
        }
        else if (req.body.name === "" 
        || req.body.phone === "" 
        || req.body.birthday === "" 
        || req.body.gender === "" 
        || req.body.address === "") {
            return res.json({
                status: 0,
                message: "Required Information!"
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
        else { //name,phone,password, birthday, gender,address, avatar_url
            const info = usr_info.getInfo();
            const id = info['id'];
            await db.query("SELECT * FROM member WHERE phone = ?", [req.body.phone], async (error, results) => {
                if (error) {
                    console.log(error);
                    return res.json({
                        error: "Unknown error"
                    });
                }
                if (results.length !== 0) {
                    return res.json({
                        status: 0,
                        message: "Phone number is already in use!"
                    })
                }
                else {
                    let trained_month;
                    switch (req.body.package) {
                        case 1:
                            trained_month = 3;
                            break;
                        case 2:
                            trained_month = 6;
                            break;
                        case 3:
                            trained_month = 12
                            break;
                    }

                    req.body.avatar_url = '/uploads/image-1642259517998.jpg';
                    const sql_add_member = 'INSERT INTO member (name, phone, birthday, gender, address, avatar_url, admin_creator_id, password, package, trained_month, trainer_id) Values (' + mysql.escape(req.body.name) + ', ' + mysql.escape(req.body.phone) + ', ' + mysql.escape(req.body.birthday) + ', ' + mysql.escape(req.body.gender) + ', ' + mysql.escape(req.body.address) + ', ' + mysql.escape(req.body.avatar_url) + ', ' + mysql.escape(id) + ", \'$2a$08$Bdf1eMhN9TjlRFy2U32bz.oYnuqlUsPXqxN1aBnf.mhasSmgKhBKy\', " + mysql.escape(req.body.package) + ', ' + mysql.escape(trained_month) + ", 1)";
                    await db.query(sql_add_member, (error) => {
                        if (error) {
                            console.log(error);
                            return res.json({
                                error: "Unknown error"
                            });
                        }
                        else {
                            return res.json({
                                status: 1,
                                message: "Add member successfully!",
                                data: {
                                    phone: req.body.phone,
                                    password: '123456'
                                }
                            });
                        }
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
exports.viewMemberDetail = async (req, res) => {
    try {
        const id = req.query.id;

        const sql_view_member = 'SELECT * FROM member WHERE id = ' + mysql.escape(id);
        await db.query(sql_view_member, (error, results) => {
            if (error) {
                console.log(error);
                return res.json({
                    error: "Unknown error"
                });
            }
            if (results.length === 0) {
                return res.json({
                    status: 0,
                    message: "Empty!"
                });
            }
            else {
                return res.json({
                    status: 1,
                    message: "Get member detail successfully!",
                    data: {
                        id: results[0].id,
                        name: results[0].name,
                        phone: results[0].phone,
                        birthday: results[0].birthday,
                        gender: results[0].gender,
                        address: results[0].address,
                        created_at: results[0].created_at,
                        expired_at: results[0].expired_at,
                        created_by: results[0].admin_creator_id,
                        avatar_url: results[0].avatar_url,
                        trainer_id: results[0].trainer_id,
                    }
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
exports.viewMemberList = async (req, res) => {
    try {
        const sql_view_memberList = "SELECT member.id as id, member.active as active, member.gender as gender, member.name as name, member.avatar_url as avatar_url, member.phone as phone, trainer.name as trainer_name FROM member, trainer WHERE trainer.id = member.trainer_id";
        await db.query(sql_view_memberList, (error, results) => {
            if (error) {
                console.log(error);
                return res.json({
                    error: "Unknown error"
                });
            }
            if (results.length > 0) {
                let memberList = [];
                for (let member of results) {
                    memberList.push(member);
                }
                return res.json({
                    status: 1,
                    message: "Get member list successfully!",
                    data: {
                        memberList
                    }
                });
            }
            else {
                return res.json({
                    status: 0,
                    message: "Empty!"
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
exports.viewMemberListOfTrainer = async (req, res) => {
    try {
        const id = req.params.id;

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
                message: 'Lấy danh sách hội viên của HLV thành công!',
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
exports.updateMember = async (req, res) => {
    try {
        if (req.body === {} || req.body.name === undefined || req.body.birthday === undefined || req.body.gender === undefined || req.body.address === undefined) {
            return res.json({
                status: 0,
                message: "Required information!"
            });
        }
        else if (req.body.name === "" || req.body.birthday === "" || req.body.gender === "" && req.body.address === "") {
            return res.json({
                status: 0,
                message: "Required information!"
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
        else {
            const id = req.query.id;
            const { name, birthday, gender, address, avatar_url } = req.body;

            await db.query("UPDATE member SET name = ?, birthday = ?, gender = ?, address = ?, avatar_url = ? WHERE id = ?", [name, birthday, gender, address, avatar_url, id], (error) => {
                if (error) throw error;
                else {
                    return res.json({
                        status: 1,
                        message: "Update member successfully!"
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
exports.deleteMember = async (req, res) => {
    try {
        const id = req.params.id;

        await db.query("UPDATE member SET active = 0 WHERE id = ?;", [id], (error) => {
            if (error) throw error;
            else {
                return res.json({
                    status: 1,
                    message: "Delete member successfully!"
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
exports.restoreMember = async (req, res) => {
    try {
        const id = req.params.id;

        await db.query("UPDATE member SET active = 1 WHERE id = ?;", [id], (error) => {
            if (error) throw error;
            else {
                return res.json({
                    status: 1,
                    message: "Restore member successfully!"
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
// exports.renewPackage = async (req, res) => {
//     try {
//         const id = req.query.id;

//         await db.query("UPDATE member SET package = ? WHERE id = ?", [req.body.package, id], (error) => {
//             if (error) {
//                 console.log(error);
//                 return res.json({
//                     error: "Unknown error"
//                 });
//             }
//             else {
//                 return res.json({
//                     status: 1,
//                     message: "Renew member package successfully!"
//                 });
//             }
//         });
//     }
//     catch (error) {
//         console.log(error);
//         return res.json({
//             error: "Unknown error"
//         });
//     }
// }
exports.changeTrainer = (req, res) => {
    try {
        const {id} = req.params;
        const {trainer_id} = req.body;
        const sql_pairing = "UPDATE member SET trainer_id = " + mysql.escape(trainer_id) + " WHERE id = " + mysql.escape(id);
        db.query(sql_pairing, (error) => {
            if (error) {
                console.log(error);
                return res.json({
                    error: "Unknown error"
                });
            }
            return res.json({
                status: 1,
                message: "Ghép huấn luyện viên với học viên thành công"
            });
        });
    }
    catch (error) {
        return res.json({
            error: "Unknown error"
        });
    }
}
// event
exports.createEvent = async (req, res) => {
    try {
        //check thiếu trường
        if (req.body === {} || req.body.title === undefined || req.body.detail_title === undefined || req.body.content === undefined || req.body.start_time === undefined || req.body.finish_time === undefined || req.body.thumbnail_image_url === undefined || req.body.detail_image_url === undefined) {
            return res.json({
                status: 0,
                message: "Required information!"
            });
        }
        else if (req.body.title === "" || req.body.detail_title === "" || req.body.content === "" || req.body.start_time === "" || req.body.finish_time === "" || req.body.thumbnail_image_url === "" || req.body.detail_image_url === "") {
            return res.json({
                status: 0,
                message: "Required information!"
            });
        }
        const { title, detail_title, content, start_time, finish_time, thumbnail_image_url, detail_image_url } = req.body;
        const sql_createEvent = 'INSERT INTO event (title,detail_title,content,start_time,finish_time,thumbnail_image_url,detail_image_url) Values (' + mysql.escape(title) + ', ' + mysql.escape(detail_title) + ', ' + mysql.escape(content) + ', ' + mysql.escape(start_time) + ', ' + mysql.escape(finish_time) + ', ' + mysql.escape(thumbnail_image_url) + ', ' + mysql.escape(detail_image_url) + ")";
        await db.query(sql_createEvent, (error) => {
            if (error) {
                console.log(error);
                return res.json({
                    error: "Unknown error"
                });
            }
            else {
                return res.json({
                    status: 1,
                    message: "Tạo sự kiện thành công!"
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
exports.changeEvent = async (req, res) => {
    try {
        //check thiếu trường
        if (req.body === {} || req.body.title === undefined || req.body.detail_title === undefined || req.body.content === undefined || req.body.start_time === undefined || req.body.finish_time === undefined || req.body.thumbnail_image_url === undefined || req.body.detail_image_url === undefined) {
            return res.json({
                status: 0,
                message: "Thông tin bắt buộc!"
            });
        }
        else if (req.body.title === "" || req.body.detail_title === "" || req.body.content === "" || req.body.start_time === "" || req.body.finish_time === "" || req.body.thumbnail_image_url === "" || req.body.detail_image_url === "") {
            return res.json({
                status: 0,
                message: "Thông tin bắt buộc!"
            });
        }
        let {title, detail_title, content, start_time, finish_time, thumbnail_image_url, detail_image_url} = req.body;
        start_time = new Date(start_time);
        finish_time = new Date(finish_time);
        const sql_changeEvent = 'Update event SET title =  ' + mysql.escape(title) + ',detail_title = ' + mysql.escape(detail_title) + ',content = ' + mysql.escape(content) + ',start_time =' + mysql.escape(start_time) + ',finish_time = ' + mysql.escape(finish_time) + ',thumbnail_image_url =' + mysql.escape(thumbnail_image_url) + ',detail_image_url =' + mysql.escape(detail_image_url) + " Where id = " + mysql.escape(req.params.id);
        await db.query(sql_changeEvent, (error) => {
            if (error) {
                console.log(error);
                return res.json({
                    error: "Unknown error"
                });
            }
            else {
                return res.json({
                    status: 1,
                    message: "Cập nhật sự kiện thành công!"
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
exports.deleteEvent = async (req, res) => {
    try {
        const sql_changeEvent = "Delete from event  Where id =" + mysql.escape(req.params.id);
        await db.query(sql_changeEvent, (error) => {
            if (error) {
                console.log(error);
                return res.json({
                    status: 0,
                    message: "Unknown error"
                });
            }
            else {
                return res.json({
                    status: 1,
                    message: "Xóa sự kiện thành công!"
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
exports.viewEventList = async (req, res) => {
    try {
        const page = req.query.page
        const quantity_per_page = req.query.quantity_per_page
        const sql_view_EventList = "SELECT id, title, content, start_time, finish_time, thumbnail_image_url, detail_image_url FROM event";
        await db.query(sql_view_EventList, (error, results) => {
            if (error) {
                console.log(error);
                return res.json({
                    error: "Unknown error"
                });
            }
            if (results.length === 0) {
                return res.json({
                    status: 0,
                    message: "Empty!"
                });
            }
            if (results.length !== 0) {
                const quantity = results.length;
                let eventList = [];
                for (let member of results) {
                    eventList.push(member);
                }
                return res.json({
                    status: 1,
                    message: "Lấy danh sách sự kiện thành công!",
                    data: {
                        event_list: eventList
                    },
                    quantity,
                    quantity_per_page,
                    page
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
exports.viewEventDetail = async (req, res) => {
    try {
        // app.get('/admin/event/:id', function(req,res){} );
        const id = req.params.id;
        const sql_view_EventDetail = "SELECT id, title,detail_title,content, start_time, finish_time, thumbnail_image_url,detail_image_url FROM event where id = " + mysql.escape(id);
        await db.query(sql_view_EventDetail, (error, results) => {
            if (error) {
                console.log(error);
                return res.json({
                    error: "Unknown error"
                });
            }
            if (results.length === 0) {
                return res.json({
                    status: 0,
                    message: "Empty!",
                });
            }
            return res.json({
                status: 1,
                message: "Lấy thông tin chi tiết sự kiện thành công!",
                data: results[0]
            });
        }
        );
    }
    catch (error) {
        console.log(error);
        return res.json({
            error: "Unknown error"
        });
    }
}
exports.viewAllSchedules = (req, res) => {
    try {
        const sql_get_all_schedules = "SELECT trainer.name, member.name, schedule.startTime, schedule.finishTime, schedule.place, schedule.detail, schedule.absence FROM schedule INNER JOIN member on member.id=schedule.member_id INNER JOIN trainer on trainer.id=schedule.trainer_id ORDER BY start_time DESC";
        db.query(sql_get_all_schedules, (error, results) => {
            if (error) {
                console.log(error);
                return res.json({
                    error: "Unknown error"
                });
            }
            if (results.length === 0) {
                return res.json({
                    status: 0,
                    message: "Empty!"
                });
            }

            let res_array = [];
            for (let result of results) {
                res_array.push(result);
            }
            return res.json({
                status: 1,
                message: "Lấy thông tin toàn bộ lịch tập thành công",
                data:
                    res_array
            });
        })
    }
    catch (error) {
        console.log(error);
        return res.json({
            error: "Unknown error"
        });
    }
}