const multer = require("multer");
const path = require("path");

// Multer config
module.exports = multer({
  storage: multer.diskStorage({
    destination: 'public/uploads',
    filename: (req, file, cb) => {
      cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
  }),
  fileFilter: (req, file, cb) => {
    // Allowed ext
    const filetypes = /jpeg|jpg|png|gif/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);
    if(mimetype && extname){
      return cb(null, true);
    }
    else {
      // thêm thuộc tính của request để check ở phần route (để hàm check ở route có thể trả về response)
      req.checkWrongFileType = "{\n" +
          "            status: 0,\n" +
          "            message: \"Wrong file format!\"\n" +
          "        }";
      return cb(null, false, new Error(req.checkWrongFileType));
    }
  }
});