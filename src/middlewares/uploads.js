const multer = require("multer");

const storage = multer.memoryStorage(); // Use memory storage to process files in memory

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["image/", "video/", "application/pdf"];

  if (allowedMimeTypes.some((type) => file.mimetype.startsWith(type))) {
    cb(null, true);
  } else {
    cb(
      new Error("Not an image or video! Please upload an appropriate file."),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 },
});

module.exports = upload;
