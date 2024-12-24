const multer = require('multer');
const path = require('path');


const storage = multer.diskStorage({
    destination: (req, res, cb) => {
        cb(null, 'src/uploads')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now()+"-"+file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only image/jpeg, png, gif and jpg are allowed."), false); // Tệp không hợp lệ
    }
};

const limits = {
    fileSize: 5*1024* 1024,
};

const upload = multer({
    storage,
    fileFilter,
    limits
});


module.exports = upload;