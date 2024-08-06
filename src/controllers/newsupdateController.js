const path = require('path');
const responseHandler = require("../helpers/responseHandler");
const News = require("../models/news");
const { NewsSchema } = require("../validation");
const handleFileUpload = require("../utils/fileHandler");
const deleteFile = require("../helpers/deleteFiles");

/****************************************************************************************************/
/*                                    Function to create news                                       */
/****************************************************************************************************/
exports.createNews = async (req, res) => {
    const data = req.body;

    const { error } = NewsSchema.validate(data, { abortEarly: true });
    if (error) {
        return responseHandler(res, 400, `Invalid input: ${error.message}`);
    }

    const newsExist = await News.findOne({ category: data.category, title: data.title, content: data.content });
    if (newsExist) {
        return responseHandler(res, 400, "News article already exists");
    }

    let image = '';
    if (req.file) {
        try {
            image = await handleFileUpload(req.file, path.join(__dirname, '../uploads/news'));
        } catch (err) {
            return responseHandler(res, 500, err.message);
        }
    }

    const newNews = new News({ ...data, image });

    try {
        await newNews.save();
        return responseHandler(res, 201, "New news article created successfully!", newNews);
    } catch (err) {
        return responseHandler(res, 500, `Error saving news: ${err.message}`);
    }
};

/****************************************************************************************************/
/*                                    Function to edit news                                        */
/****************************************************************************************************/
exports.editNews = async (req, res) => {
    const { newsId } = req.params;
    const data = req.body;

    if (!newsId) {
        return responseHandler(res, 400, "Invalid request");
    }

    const { error } = NewsSchema.validate(data, { abortEarly: true });
    if (error) {
        return responseHandler(res, 400, `Invalid input: ${error.message}`);
    }

    const news = await News.findById(newsId);
    if (!news) {
        return responseHandler(res, 404, "News article not found");
    }

    let image = news.image;
    if (req.file) {
        try {
            if (news.image) {
                await deleteFile(path.join(__dirname, '../uploads/news', path.basename(news.image)));
            }
            image = await handleFileUpload(req.file, path.join(__dirname, '../uploads/news'));
        } catch (err) {
            return responseHandler(res, 500, err.message);
        }
    }

    Object.assign(news, data, { image });

    try {
        await news.save();
        return responseHandler(res, 200, "News article updated successfully!", news);
    } catch (err) {
        return responseHandler(res, 500, `Error saving news: ${err.message}`);
    }
};

/****************************************************************************************************/
/*                                  Function to get all news articles                               */
/****************************************************************************************************/
exports.getAllNews = async (req, res) => {
    const news = await News.find();
    return responseHandler(res, 200, "News articles retrieved successfully", news);
};

/****************************************************************************************************/
/*                                 Function to get news article by id                               */
/****************************************************************************************************/
exports.getNewsById = async (req, res) => {
    const { newsId } = req.params;

    if (!newsId) {
        return responseHandler(res, 400, "Invalid request");
    }

    const news = await News.findById(newsId);
    if (!news) {
        return responseHandler(res, 404, "News article not found");
    }

    return responseHandler(res, 200, "News article retrieved successfully", news);
};

/****************************************************************************************************/
/*                                 Function to delete news article                                  */
/****************************************************************************************************/
exports.deleteNews = async (req, res) => {
    const { newsId } = req.params;

    if (!newsId) {
        return responseHandler(res, 400, "Invalid request");
    }

    const news = await News.findByIdAndDelete(newsId);
    if (!news) {
        return responseHandler(res, 404, "News article not found");
    }

    if (news.image) {
        try {
            await deleteFile(path.join(__dirname, '../uploads/news', path.basename(news.image)));
        } catch (err) {
            return responseHandler(res, 500, `Error deleting file: ${err.message}`);
        }
    }

    return responseHandler(res, 200, "News article deleted successfully");
};
