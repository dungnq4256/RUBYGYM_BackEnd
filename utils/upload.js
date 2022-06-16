const cloudinary = require("./cloudinary");
const dbConnection = require("../utils/dbConnection")
const usr_info = require("../utils/authentication");
const mysql = require("mysql");

const db = dbConnection.createConnection();

let UploadImage = async (req, res) => {
  try {
    // Upload image to cloudinary
    const result = await cloudinary.uploader.upload(req.file.path);

    // update image url to database
    const info = usr_info.getInfo();
    // const sql_upload_image = "UPDATE TABLE " + info['role'] + " SET avatar_url=" + mysql.escape(result.secure_url) + " WHERE id=" + info['id'];
    // await db.query(sql_upload_image, (error) => {
    //   if (error) {
    //     console.log(error);
    //     return res.json({
    //       error: error
    //     });
    //   }
    //   else {
    //   }
    // });
    
        return res.json({
          status: 1,
          message: "Upload image successfully!",
          data: {
            "imageURL": result.secure_url,
          }
        });
  }
  catch (err) {
    console.log(err);
    return res.json({
      error: err
    })
  }
};

module.exports = {
  UploadImage
}