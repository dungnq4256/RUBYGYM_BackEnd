const dbConnection = require("../utils/dbConnection");
const usr_info = require('../utils/authentication')
const mysql = require("mysql");
const async = require("hbs/lib/async");
const db = dbConnection.createConnection();

function convertMonth(month){
    if(month === 1) return "%Jan%";
    if(month === 2) return "%Feb%";
    if(month === 3) return "%Mar%";
    if(month === 4) return "%Apr%";
    if(month === 5) return "%May%";
    if(month === 6) return "%Jun%";
    if(month === 7) return "%Jul%";
    if(month === 8) return "%Aug%";
    if(month === 9) return "%Sep%";
    if(month === 10) return "%Oct%";
    if(month === 11) return "%Nov%";
    if(month === 12) return "%Dec%";
}

let CheckMatchSchedule = async( req, res, next) => {
    const info = usr_info.getInfo();

    // lấy dữ liệu trainer_id, member_id, lặp lại theo tuần, giờ bắt đầu, giờ kết thúc từ request body
    const id = info['id']; // = trainer_id
    const {member_id, repeat_weekly} = req.body;
    const start_time = new Date(req.body.start_time);
    const finish_time = new Date(req.body.finish_time);

    // check dữ liệu đầu vào, nếu chưa xác định trả về json thông báo
    if(member_id === undefined || start_time === undefined || finish_time === undefined || repeat_weekly === undefined){
        return res.json({
            status: 0,
            message: "Required Information!"
        })
    // check dữ liệu đầu vào, nếu dữ liệu rỗng trả về json thông báo
    } else if(member_id === "" || start_time === "" || finish_time === "" || repeat_weekly == null){
        return res.json({
            status: 0,
            message: "Required Information!"
        })
    // nếu dữ liệu đầy đủ, tiến hành kiểm tra trùng lặp khung giờ đối với lịch lặp theo tuần      
    }

    // checking if create 2 or more similar schedules with 1 member
    const sql_check_isDuplicated = "SELECT * FROM schedule WHERE trainer_id = " + mysql.escape(id) + " AND member_id = " + mysql.escape(member_id) + " AND start_time = " + mysql.escape(Number(start_time));
    db.query(sql_check_isDuplicated, async (error, result) => {
        if (error) {
            console.log(error);
            return res.json({
                error: error
            });
        }
        console.log(result);
        if (result.length !== 0){
            return res.json({
                status: 0,
                message: "Lịch tập này đã bị trùng"
            });
        }
        else if(repeat_weekly === 1) {
            // start và finish để chạy vòng lặp cho ngày trong tháng
            let start = new Date(start_time);
            let finish = new Date(finish_time);
        }
        // checking if create 2 or more similar schedules with 1 member
        const sql_check_isDuplicated = "SELECT * FROM schedule WHERE trainer_id = " + mysql.escape(id) + " AND member_id = " + mysql.escape(member_id) + " AND start_time = " + mysql.escape(Number(start_time));
        db.query(sql_check_isDuplicated, async (error, result) => {
            if (error) {
                console.log(error);
                return res.json({
                    error: "Unknown error"
                });
            }
            if (result.length !== 0){
                return res.json({
                    status: 0,
                    message: "Lịch tập này đã bị trùng"
                });
            }
            else {
                if(repeat_weekly === 1) {
                    // start và finish để chạy vòng lặp cho ngày trong tháng
                    let start = new Date(start_time);
                    let finish = new Date(finish_time);

                    // biến check trùng, ban đầu để true
                    let check = true;

                    while(start.getMonth() === start_time.getMonth()){
                        // truy vấn đến database để lấy số buổi tập trùng giờ buổi tập muốn thêm vào
                        let sql = 'SELECT id FROM schedule WHERE  trainer_id = '+ mysql.escape(id) + ' AND ( ( finish_time - 1 BETWEEN '+ mysql.escape(start.getTime()) + ' AND ' + mysql.escape(finish.getTime()) + ') OR (start_time + 1  BETWEEN ' + mysql.escape(start.getTime()) + ' AND ' + mysql.escape(finish.getTime()) + ') OR ( ' + (mysql.escape(start.getTime()) + 1) + ' BETWEEN start_time AND finish_time ) )';
                        await db.query(sql, function (err, result){
                            if(err){
                                console.log(err);
                                return res.json({
                                    error: "Unknown error"
                                });
                            }
                            else {
                                // nếu có ít hơn 3 lịch tập trùng giờ
                                if(result.length < 3){
                                    // tăng start và finish lên thêm 7 ngày
                                    start.setDate(start.getDate() + 7);
                                    finish.setDate(finish.getDate() + 7);

                                    // ngược lại, gán check = false và thoát vòng lặp
                                } else {
                                    check = false;
                                }
                            }
                        });
                        if (check === false) {
                            break;
                        }
                    }
                    // nếu check = false, trả về thông báo
                    if(check === false){
                        return res.json( start_time, finish_time , {
                            status: 0,
                            message: 'Không thể thêm lịch do vượt quá số lượng người tập!',
                        })
                        // nếu check = true, gọi next
                    } else next();

                    // while(start.getMonth() === start_time.getMonth()){
                    //     // truy vấn đến database để lấy số buổi tập trùng giờ buổi tập muốn thêm vào
                    //     let sql = 'SELECT id FROM schedule WHERE  trainer_id = '+ mysql.escape(id) + ' AND ( ( finish_time - 1 BETWEEN '+ mysql.escape(start.getTime()) + ' AND ' + mysql.escape(finish.getTime()) + ') OR (start_time + 1  BETWEEN ' + mysql.escape(start.getTime()) + ' AND ' + mysql.escape(finish.getTime()) + ') OR ( ' + (mysql.escape(start.getTime()) + 1) + ' BETWEEN start_time AND finish_time ) )';
                    //     await db.query(sql, function (err, result){
                    //         if(err){
                    //             console.log(err);
                    //             return res.json({
                    //                 error: "Unknown error"
                    //             });
                    //         }
                    //         else {
                    //             // nếu có ít hơn 3 lịch tập trùng giờ
                    //             if(result.length < 3){
                    //                 // tăng start và finish lên thêm 7 ngày
                    //                 start.setDate(start.getDate() + 7);
                    //                 finish.setDate(finish.getDate() + 7);

                    //                 // ngược lại, gán check = false và thoát vòng lặp
                    //             } else {
                    //                 check = false;
                    //             }
                    //         }
                    //     });
                    //     if (check === false) {
                    //         break;
                    //     }
                    // }
                    // // nếu check = false, trả về thông báo
                    // if(check === false){
                    //     return res.json( start_time, finish_time , {
                    //         status: 0,
                    //         message: 'Không thể thêm lịch do vượt quá số lượng người tập!',
                    //     })
                    //     // nếu check = true, gọi next
                    // } else next();

                    // tiến hành kiểm tra trùng lặp khung giờ đối với lịch không lặp theo tuần
                } else {
                    // gán start và finish là thời gian bắt đầu và kết thúc của buổi tập
                    let start = new Date(start_time);
                    let finish = new Date(finish_time);
                    // kết nối tới database và truy vấn số buổi tập trùng giờ
                    let sql = 'SELECT id FROM schedule WHERE trainer_id = ' + mysql.escape(id) + ' AND ( ( finish_time - 1 BETWEEN ' + mysql.escape(start.getTime()) + ' AND ' + mysql.escape(finish.getTime()) + ') OR (start_time + 1  BETWEEN '+ mysql.escape(start.getTime()) + ' AND ' + mysql.escape(finish.getTime()) + ') OR ( ' + (mysql.escape(start.getTime()) + 1) + ' BETWEEN start_time AND finish_time ) )';
                    // nếu truy vấn lỗi, trả về thông báo
                    await db.query(sql, function(err, result){
                        if(err){
                            console.log(err);
                            res.json({
                                status: 500,
                                message: "System Error!"
                            })
                        }
                        else {
                            // nếu có ít hơn 3 buổi tập trùng giờ, gọi hàm next
                            if(result.length < 3){
                                next();
                                // ngược lại, trả về thông báo đã đủ người
                            } else {
                                return res.json({
                                    status: 0,
                                    message: "không thể thêm lịch do vượt quá số lượng người tập!"
                                })
                            }
                        }
                    });
                }
            }
        });
    });

}

let ShowTrainerSchedule = async(req, res) => {
    // lấy biến year và month từ request, khởi tạo kết nối tới database
    const {year, month} = req.query;
    let years = '%' + year.toString() + '%';
    // lấy id của trainer
    const info = usr_info.getInfo();
    const id = info['id'];
    // câu lệnh truy vấn
    const sql = 'SELECT sche.id AS schedule_id, sche.startTime AS start_time, sche.finishTime AS finish_time, sche.absence AS is_cancelled FROM schedule AS sche INNER JOIN member AS mem ON mem.id = sche.member_id WHERE sche.trainer_id = ' + mysql.escape(id) + ' AND sche.startTime LIKE ' + mysql.escape(convertMonth(Number(month))) + ' AND sche.startTime LIKE ' + mysql.escape(years);
    // thực hiện truy vấn đến database, trả về kết quả tương ứng
    try{
        await db.query(sql, (error, result) => {
            if (error) {
                return res.json({
                    error: error
                });
            }
            return res.json({
                status: 1,
                message: "Get schedule successfully!",
                lengthOfData: result.length,
                data: result
            });
            // nếu có lỗi trong quá trình truy vấn đến database, gửi response báo hệ thống lỗi
        });
    }
    catch (error) {
        console.log(error);
        return res.json({
            error: "Unknown error"
        });
    }
}
let ShowMemberSchedule = async(req, res) => {
    // lấy biến year và month từ request, khởi tạo kết nối tới database
    const {year, month} = req.query;
    let years = '%' + year.toString() + '%';
    // lấy id của member
    const info = usr_info.getInfo();
    const id = info['id'];
    // câu lệnh truy vấn
    const sql = 'SELECT sche.id AS schedule_id, sche.startTime AS start_time, sche.finishTime AS finish_time, sche.absence AS is_cancelled FROM schedule AS sche INNER JOIN member AS mem ON mem.id = sche.member_id WHERE sche.member_id = ' + mysql.escape(id) + ' AND sche.startTime LIKE ' + mysql.escape(convertMonth(Number(month))) + ' AND sche.startTime LIKE ' + mysql.escape(years);
    // thực hiện truy vấn đến database, trả về kết quả tương ứng
    try{
        await db.query(sql, (error, result) => {
            if (error) {
                return res.json({
                    error: error
                });
            }
            return res.json({
                status: 1,
                message: "Get schedule successfully!",
                lengthOfData: result.length,
                data: result
            });
            // nếu có lỗi trong quá trình truy vấn đến database, gửi response báo hệ thống lỗi
        });
    }
    catch(err){
        console.log(err);
        return res.json({
            error: "Unknown error"
        });
    }
}

let ShowDetailTrainerSchedule = async ( req, res) => {
    try{
        // lấy biến trainer_id từ request, khởi tạo kết nối tới database
        const info = usr_info.getInfo();
        const id = info['id'];
        
        // câu lệnh truy vấn
        const date = req.query.date.substring(0, 16);
        const day = '%' + date + '%';
        const sql = 'SELECT sche.id AS id, mem.id AS member_id, mem.name , sche.startTime AS start_time, absence, sche.finishTime AS finish_time, sche.detail AS lecture, sche.place AS location, sche.absence AS is_cancelled, sche.trainer_id as trainer_id FROM schedule AS sche INNER JOIN member AS mem ON mem.id = sche.member_id WHERE sche.trainer_id = ' + mysql.escape(id) + ' AND sche.startTime LIKE ' + mysql.escape(day) + 'ORDER BY startTime';
        // thực hiện truy vấn đến database, trả về kết quả tương ứng
        await db.query(sql, (error, result) => {
            if (error) {
                console.log(error);
                return res.json({
                    error: "Unknown error"
                });
            }
            if (result.length === 0) {
                return res.json({
                    status: 1,
                    message: "Empty!"
                })
            }
            else {
                return res.json({
                    status: 1,
                    message: "Lấy thông tin chi tiết lịch tập thành công!",
                    data: result
                })
            }
        });
    // nếu có lỗi trong quá trình truy vấn đến database, gửi response báo hệ thống lỗi
    } catch (err){
        console.log(error);
        return res.json({
            error: "Unknown error"
        });
    }
}
let ShowDetailMemberSchedule = async ( req, res) => {
    // lấy biến member_id từ request, khởi tạo kết nối tới database
    const info = usr_info.getInfo();
    const id = info['id'];

    // câu lệnh truy vấn
    const date = req.query.date.substring(0, 16);
    const day = '%' + date + '%';
    const sql = 'SELECT absence, sche.id AS id, mem.id AS member_id, mem.name , sche.startTime AS start_time, sche.finishTime AS finish_time, sche.detail AS lecture, sche.place AS location, sche.absence AS is_cancelled, sche.member_id as member_id FROM schedule AS sche INNER JOIN member AS mem ON mem.id = sche.member_id WHERE sche.member_id = ' + mysql.escape(id) + ' AND sche.startTime LIKE ' + mysql.escape(day) + 'ORDER BY startTime';
    // thực hiện truy vấn đến database, trả về kết quả tương ứng
    try{
        await db.query(sql, (error, result) => {
            if (error) {
                return res.json({
                    error: error
                });
            }
            if (result.length === 0) {
                return res.json({
                    status: 1,
                    message: "Empty!",
                    data: result
                })
            }
            else {
                return res.json({
                    status: 1,
                    message: "Lấy thông tin thành công!",
                    data: result
                })
            }
        });
    // nếu có lỗi trong quá trình truy vấn đến database, gửi response báo hệ thống lỗi
    } catch (err){
        console.log(err);
        return res.json({
            status: 500,
            message: "System Error!"
        })
    }
}

let CreateSchedule = async (req, res) => {
    try {
        // lấy các dữ liệu từ request
        console.log(req.body)
        const info = usr_info.getInfo();
        const id = info['id'];

        const {member_id, location, lecture, repeat_weekly} = req.body;
        const is_cancelled = 0;
        const start_time = new Date(req.body.start_time);
        const finish_time = new Date(req.body.finish_time);

        // nếu lịch là lặp lại theo tuần
        if(repeat_weekly == 1){
            console.log('ha')
            // dùng start và finish là biến lặp
            let start = new Date(start_time);
            let finish = new Date(finish_time);

            // trong khi start vẫn còn nằm trong tháng
            while(start.getMonth() === start_time.getMonth()){
                // kết nối tới database và thêm lịch tập
                let sql = 'INSERT INTO schedule(member_id, trainer_id, startTime, finishTime, start_time, finish_time, detail, absence, place) VALUES (' + mysql.escape(member_id) + ', ' + mysql.escape(id) + ', ' + mysql.escape(start.toString()) + ', ' + mysql.escape(finish.toString()) + ', ' + mysql.escape(start.getTime()) + ', ' + mysql.escape(finish.getTime()) + ', ' + mysql.escape(lecture) + ', ' + mysql.escape(is_cancelled) + ', '+ mysql.escape(location) + ')';
                // nếu có lỗi, trả về thông báo
                await db.query(sql, function(err){
                    if (err) {
                        console.log(err);
                        return res.json({
                            error: "Unknown error"
                        });
                    }
                });
                
                console.log('Hi');
                start.setDate(start.getDate() + 7);
                finish.setDate(finish.getDate() + 7);
            }
            return res.json({
                status: 1,
                message: "Create schedule successfully!"
            });
            // nếu có lỗi trong quá trình truy vấn đến database, gửi response báo hệ thống lỗi
        };
    } catch(err){
        console.log(err);
        return res.json({
            status: 500,
            message: "System Error!"
        })
    }
}

let ShowDetailAdminScheduleTrainer = async ( req, res) => {

    const {id} = req.query;
    // câu lệnh truy vấn
    const date = req.query.date.substring(0, 16);
    console.log(id, date)
    const day = '%' + date + '%';
    const sql = 'SELECT absence, sche.id AS id, mem.id AS member_id, mem.name , sche.startTime AS start_time, sche.finishTime AS finish_time, sche.detail AS lecture, sche.place AS location, sche.absence AS is_cancelled, sche.trainer_id as trainer_id FROM schedule AS sche INNER JOIN member AS mem ON mem.id = sche.member_id WHERE sche.trainer_id = ' + mysql.escape(id) + ' AND sche.startTime LIKE ' + mysql.escape(day) + 'ORDER BY startTime';
    // thực hiện truy vấn đến database, trả về kết quả tương ứng
    try{
        await db.query(sql, (error, result) => {
            if (error) {
                return res.json({
                    error: "Unknown error"
                });
            }
            if (result.length === 0) {
                return res.json({
                    status: 1,
                    message: "Empty!",
                    data: result
                })
            }
            else {
                return res.json({
                    status: 1,
                    message: "Lấy thông tin thành công!",
                    data: result
                })
            }
        });
    // nếu có lỗi trong quá trình truy vấn đến database, gửi response báo hệ thống lỗi
    } catch (err){
        console.log(err);
        return res.json({
            status: 500,
            message: "System Error!"
        })
    }
}
let ShowDetailAdminScheduleMember = async ( req, res) => {
    // lấy biến member_id từ request, khởi tạo kết nối tới database
    const {id} = req.query;

    // câu lệnh truy vấn
    const date = req.query.date.substring(0, 16);
    const day = '%' + date + '%';
    const sql = 'SELECT absence, sche.id AS id, mem.id AS member_id, mem.name , sche.startTime AS start_time, sche.finishTime AS finish_time, sche.detail AS lecture, sche.place AS location, sche.absence AS is_cancelled, sche.member_id as member_id FROM schedule AS sche INNER JOIN member AS mem ON mem.id = sche.member_id WHERE sche.member_id = ' + mysql.escape(id) + ' AND sche.startTime LIKE ' + mysql.escape(day) + 'ORDER BY startTime';
    // thực hiện truy vấn đến database, trả về kết quả tương ứng
    try{
        await db.query(sql, (error, result) => {
            if (error) {
                return res.json({
                    error: error
                });
            }
            if (result.length === 0) {
                return res.json({
                    status: 1,
                    message: "Empty!",
                    data: result
                })
            }
            else {
                return res.json({
                    status: 1,
                    message: "Lấy thông tin thành công!",
                    data: result
                })
            }
        });
    // nếu có lỗi trong quá trình truy vấn đến database, gửi response báo hệ thống lỗi
    } catch (err){
        console.log(err);
        return res.json({
            status: 500,
            message: "System Error!"
        })
    }
}

let ShowAdminScheduleTrainer = async(req, res) => {
    // lấy biến year và month từ request, khởi tạo kết nối tới database
    const {year, month, id} = req.query;
    console.log(year, month, id)
    let years = '%' + year.toString() + '%';
    // câu lệnh truy vấn
    const sql = 'SELECT sche.id AS schedule_id, sche.startTime AS start_time, sche.finishTime AS finish_time, sche.absence AS is_cancelled FROM schedule AS sche INNER JOIN member AS mem ON mem.id = sche.member_id WHERE sche.trainer_id = ' + mysql.escape(id) + ' AND sche.startTime LIKE ' + mysql.escape(convertMonth(Number(month))) + ' AND sche.startTime LIKE ' + mysql.escape(years);
    // thực hiện truy vấn đến database, trả về kết quả tương ứng
    try{
        await db.query(sql, (error, result) => {
            if (error) {
                return res.json({
                    error: error
                });
            }
            return res.json({
                status: 1,
                message: "Get schedule successfully!",
                lengthOfData: result.length,
                data: result
            });
            // nếu có lỗi trong quá trình truy vấn đến database, gửi response báo hệ thống lỗi
        });
    } catch(err){
        console.log(err);
        return res.json({
            status: 500,
            message: "System Error!"
        })
    }
}
let ShowAdminScheduleMember = async(req, res) => {
    // lấy biến year và month từ request, khởi tạo kết nối tới database
    const {year, month, id} = req.query;
    console.log(year, month, id)
    let years = '%' + year.toString() + '%';
    // lấy id của member
    // câu lệnh truy vấn
    const sql = 'SELECT sche.id AS schedule_id, sche.startTime AS start_time, sche.finishTime AS finish_time, sche.absence AS is_cancelled FROM schedule AS sche INNER JOIN member AS mem ON mem.id = sche.member_id WHERE sche.member_id = ' + mysql.escape(id) + ' AND sche.startTime LIKE ' + mysql.escape(convertMonth(Number(month))) + ' AND sche.startTime LIKE ' + mysql.escape(years);
    // thực hiện truy vấn đến database, trả về kết quả tương ứng
    try{
        await db.query(sql, (error, result) => {
            if (error) {
                return res.json({
                    error: error
                });
            }
            return res.json({
                status: 1,
                message: "Get schedule successfully!",
                lengthOfData: result.length,
                data: result
            });
            // nếu có lỗi trong quá trình truy vấn đến database, gửi response báo hệ thống lỗi
        });
    } catch(err){
        console.log(err);
        return res.json({
            status: 500,
            message: "System Error!"
        })
    }
}

let DeleteSchedule = async(req, res) => {
    const {id} = req.params;
    const sql = `DELETE FROM schedule WHERE id = ${mysql.escape(id)}`;

    await db.query(sql, function(error, result) {
        if(error){
            console.log(error);
            return res.json({
                status: 500,
                message: "System Error!"
            });
        }
        if (result.length === 0) {
            return res.json({
                status: 0,
                message: "That schedule does not exist!"
            });
        }
        else {
            return res.json({
                status: 1,
                message: "Delete schedule successfully!"
            });
        }
    });
}

let NoteAbsent = async(req, res) => {
    const {id} = req.params;

    const _sql = `SELECT absence FROM schedule WHERE id = ${mysql.escape(id)}`;
    let isAbsent;
    await db.query(_sql, async function(error, results) {
        if(error){
            console.log(error);
            return res.json({
                status: 500,
                message: "System Error!"
            });
        }
        if (results.length === 0) {
            return res.json({
                status: 0,
                message: "That schedule does not exist!"
            });
        }
        isAbsent = 1 - results[0].absence;
        console.log('hi ' + results[0].absence + ', ' + isAbsent);

        
        const sql = `UPDATE schedule SET absence = ${mysql.escape(isAbsent)} WHERE id = ${mysql.escape(id)}`;

        await db.query(sql, function(error, result) {
            if(error){
                console.log(error);
                return res.json({
                    status: 500,
                    message: "System Error!"
                });
            }
            if (result.length === 0) {
                return res.json({
                    status: 0,
                    message: "That schedule does not exist!"
                });
            }
            else {
                return res.json({
                    status: 1,
                    message: "Note absent schedule successfully!"
                });
            }
        });
    });

}

module.exports = {
    convertMonth,
    ShowTrainerSchedule: ShowTrainerSchedule,
    ShowDetailTrainerSchedule: ShowDetailTrainerSchedule,
    ShowMemberSchedule: ShowMemberSchedule,
    ShowDetailMemberSchedule: ShowDetailMemberSchedule,
    ShowAdminScheduleMember: ShowAdminScheduleMember,
    ShowDetailAdminScheduleMember: ShowDetailAdminScheduleMember,
    ShowAdminScheduleTrainer: ShowAdminScheduleTrainer,
    ShowDetailAdminScheduleTrainer: ShowDetailAdminScheduleTrainer,
    CreateSchedule: CreateSchedule,
    DeleteSchedule: DeleteSchedule,
    CheckMatchSchedule: CheckMatchSchedule,
    NoteAbsent: NoteAbsent
}