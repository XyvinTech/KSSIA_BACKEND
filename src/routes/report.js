const express = require("express");
const reportController = require("../controllers/reportController");
const authVerify = require("../middlewares/authVerify");
const asyncHandler = require("../utils/asyncHandler");
const reportRoute = express.Router();

reportRoute.use(authVerify);

reportRoute
  .route("/")
  .post(asyncHandler(reportController.createReport))
  .get(asyncHandler(reportController.getReports));

module.exports = reportRoute;
