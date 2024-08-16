const express = require("express");
const filesController = require("../controllers/filesController");
const asyncHandler = require("../utils/asyncHandler");
const authVerify = require("../middlewares/authVerify");
const upload = require("../middlewares/uploads");
const filesRoute = express.Router();

filesRoute.use(authVerify);

filesRoute
  .route("/upload")
  .put(upload.single('file'),asyncHandler(filesController.uploadImages));

filesRoute
  .route("/")
  .get(asyncHandler(filesController.getFiles));

filesRoute
  .route("/delete/:fileKey")
  .delete(asyncHandler(filesController.deleteFile));

module.exports = filesRoute;