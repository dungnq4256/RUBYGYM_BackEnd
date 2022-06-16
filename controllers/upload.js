const dbConnection = require("../utils/dbConnection")
const usr_info = require("../utils/authentication");
const mysql = require("mysql");
const db = dbConnection.createConnection();

let UploadImage = async (req, res) => {
  try {
      const result = '/uploads/' + req.file.filename;
      // update image url to database
      const info = usr_info.getInfo();
      const sql_upload_image = "UPDATE " + info['role'] + " SET avatar_url=" + mysql.escape(result) + " WHERE id=" + info['id'];
      await db.query(sql_upload_image, (error) => {
        if (error) {
          console.log(error);
          return res.json({
            error: "Unknown error"
          });
        }
        else {
          return res.json({
            status: 1,
            message: "Upload image successfully!",
            data: {
              "imageURL": result,
            }
          });
        }
      });
  }
  catch (err) {
    console.log(error);
    return res.json({
      error: "Unknown error"
    });
  }
};

module.exports = {
  UploadImage
}