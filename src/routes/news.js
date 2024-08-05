const express = require("express");
const newsController = require("../controllers/newsupdateController");
const authVerify = require("../middlewares/authVerify");
const asyncHandler = require("../utils/asyncHandler");
const upload = require("../middlewares/uploads");
const newsRoute = express.Router();

newsRoute.use(authVerify);

newsRoute.post('/', upload.single('image'), asyncHandler(newsController.createNews));
newsRoute.get('/', asyncHandler(newsController.getAllNews));

newsRoute.get('/:newsId', asyncHandler(newsController.getNewsById));
newsRoute.put('/:newsId', upload.single('image'), asyncHandler(newsController.editNews));
newsRoute.delete('/:newsId', asyncHandler(newsController.deleteNews));

module.exports = newsRoute;
