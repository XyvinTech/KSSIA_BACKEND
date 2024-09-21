require("dotenv").config();
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

    // Validate the input data
    const { error } = NewsSchema.validate(data, { abortEarly: true });
    if (error) {
        return responseHandler(res, 400, `Invalid input: ${error.message}`);
    }

    // Check if the news article already exists
    const newsExist = await News.findOne({
        category: data.category,
        title: data.title,
        content: data.content,
    });
    if (newsExist) {
        return responseHandler(res, 400, 'News article already exists');
    }

    // Handle file upload if present
    let image = '';
    const bucketName = process.env.AWS_S3_BUCKET;
    
    if (req.file) {
        try {
            image = await handleFileUpload(req.file, bucketName);
        } catch (err) {
            return responseHandler(res, 500, `Error uploading file: ${err.message}`);
        }
    }

    // Create the news article
    const newNews = new News({ ...data, image });

    try {
        await newNews.save();
        return responseHandler(res, 201, 'New news article created successfully!', newNews);
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
        return responseHandler(res, 400, 'Invalid request: News ID is required.');
    }

    // Validate the input data
    const { error } = NewsSchema.validate(data, { abortEarly: true });
    if (error) {
        return responseHandler(res, 400, `Invalid input: ${error.message}`);
    }

    // Find the existing news article
    const news = await News.findById(newsId);
    if (!news) {
        return responseHandler(res, 404, 'News article not found.');
    }

    // Handle file upload if present
    let image = news.image;
    const bucketName = process.env.AWS_S3_BUCKET;
    
    if (req.file) {
        try {
            // Delete the old image from S3 if it exists
            if (news.image) {
                const oldImageKey = path.basename(news.image);
                await deleteFile(bucketName, oldImageKey);
            }

            // Upload the new image to S3
            image = await handleFileUpload(req.file, bucketName);
        } catch (err) {
            return responseHandler(res, 500, `Error processing file: ${err.message}`);
        }
    }

    // Update the news article with new data and image
    Object.assign(news, data, { image });

    try {
        await news.save();
        return responseHandler(res, 200, 'News article updated successfully!', news);
    } catch (err) {
        return responseHandler(res, 500, `Error saving news: ${err.message}`);
    }
};

/****************************************************************************************************/
/*                                  Function to get all news articles                               */
/****************************************************************************************************/
exports.getAllNews = async (req, res) => {

    const { pageNo = 1, limit = 10 } = req.query;
    const skipCount = limit * (pageNo - 1);

    const totalCount = await News.countDocuments();
    const news = await News.find()
    .skip(skipCount)
    .limit(limit)
    .sort({ createdAt: -1 })
    .lean();

    return responseHandler(res, 200, "News articles retrieved successfully", news, totalCount);
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
        return responseHandler(res, 400, "Invalid request: News ID is required.");
    }

    try {
        // Find and delete the news article
        const news = await News.findByIdAndDelete(newsId);
        if (!news) {
            return responseHandler(res, 404, "News article not found.");
        }

        // Delete the image from S3 if it exists
        if (news.image) {
            const bucketName = process.env.AWS_S3_BUCKET;
            const imageKey = path.basename(news.image);
            await deleteFile(bucketName, imageKey);
        }

        return responseHandler(res, 200, "News article deleted successfully.");
    } catch (err) {
        return responseHandler(res, 500, `Error deleting news article: ${err.message}`);
    }
};