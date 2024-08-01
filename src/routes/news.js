const express = require("express");
const newsController = require("../controllers/newsupdateController");
const authVerify = require("../middlewares/authVerify");
const asyncHandler = require("../utils/asyncHandler");
const upload = require("../middlewares/uploads");
const newsRoute = express.Router();

newsRoute.use(authVerify);

// Create a new news article and get all news articles
newsRoute
  .route("/news")
  .post(upload.single('image'), asyncHandler(newsController.createNews))
  .get(asyncHandler(newsController.getAllNews));

// Get, edit, and delete a news article by ID
newsRoute
  .route("/news/:newsId")
  .get(asyncHandler(newsController.getNewsById))
  .put(upload.single('image'), asyncHandler(newsController.editNews))
  .delete(asyncHandler(newsController.deleteNews));

module.exports = newsRoute;
