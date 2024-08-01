const multer = require('multer');

const storage = multer.memoryStorage(); // Use memory storage to process files in memory

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image or video! Please upload appropriate file.'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
});

module.exports = upload;
