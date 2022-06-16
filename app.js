const express = require("express");
// make sure our server will start from nodejs
const dotenv = require('dotenv');
// dotenv is where we keep our sensitive information, keep everything protected
const path = require('path');
// this path is default in nodejs (no need to install)

const cors = require('cors');

const corsOptions = {
    methods: ['GET', 'PUT', 'POST', 'DELETE'],
    credential: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Set-Cookie'],
};

/*
*   dotenv.config tell where in the file that has all variables that we want
*   object {path:'./'}, ./ means the config file is in the same directory with app.js
* */
dotenv.config( {path: './.env'} );

const app = express();
// make sure we start our sever with app.js

/*
*   create a new connection with mysql database
* */

app.use(cors(corsOptions));

/*
*  publicDirectory is a directory that include all front-end file (css, html, javascript)
* __dirname is the directory contains this app.js
* public is the folder contains all font-end file
* */
const publicDirectory = path.join(__dirname, './public');
// make the express server use the static directory above
app.use(express.static(publicDirectory))
/*
*   set view engine shows what kind of view will use with HTML => hbs (handle bar)
* */

// read json file from html form in server
// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({extended: false}));
// Parse JSON bodies (as sent by API clients)
app.use(express.json());

// define routes
app.use('/auth', require('./routes/auth'));
app.use('/upload', require('./routes/upload'));
app.use('/trainer', require('./routes/trainer'));
app.use('/admin', require('./routes/admin'));
app.use('/member', require('./routes/member'));

// app.get('/admin/packages', (req, res) => {
//     res.json({
//         status: 1,
//         message: "Lấy danh sách gói tập thành công!",
//         data: {
//             package_list: [
//                 {
//                     id: '1',
//                     name: '3 tháng',
//                     price: '2.333.333'
//                 },
//                 {
//                     id: '2',
//                     name: '6 tháng',
//                     price: '4.333.333'
//                 },
//                 {
//                     id: '3',
//                     name: '12 tháng',
//                     price: '8.333.333'
//                 }
//             ]
//         }
//       })
// });
// app.post('/admin/members/:member_id/package', (req, res) => {
//     res.json({
//         status: 1,
//         message: "Renew member package successfully!"
//     });
// });
// app.get('/member/training', (req, res) => {
//     res.json({
//         status: 1,
//         message: "Lấy thông tin tập luyện thành công!",
//         data: {
//             weight: 50000,
//             height: 1700,
//             bmi: '17,3',
//             target: 'Tăng thêm 5 kg'
//         }
//     });
// });
// app.post('/member/training', (req, res) => {
//     console.log(req.body)
//     res.json({
//         status: 1,
//         message: "Cập nhật thông tin tập luyện thành công!"
//     });
// });

app.listen(5678, () => {
    console.log("Server started on Port 5678.");
});
