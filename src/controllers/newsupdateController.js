const responseHandler = require("../helpers/responseHandler");
const News = require("../models/news");
const { NewsSchema } = require("../validation");
const fs = require('fs');
const path = require('path');

// Helper function to handle file deletion
const deleteFile = (filePath) => {
    fs.unlink(filePath, (err) => {
        if (err) {
            console.error('Error deleting file:', err);
        }
    });
};

/****************************************************************************************************/
/*                                    Function to create news                                       */
/****************************************************************************************************/

// Create a new news article
exports.createNews = async (req, res) => {
    const data = req.body;

    // Validate the input data
    const { error } = NewsSchema.validate(data, {
        abortEarly: true
    });

    // Check if an error exists in the validation
    if (error) {
        return responseHandler(res, 400, `Invalid input: ${error.message}`);
    }

    const newsExist = await News.findOne({ category: data.category, title: data.title, content: data.content });    
    if (newsExist) {
        return responseHandler(res, 400, "News article already exists");
    }

    // Handle file upload if present
    let image = '';
    if (req.file) {
        // Get current date in YYYYMMDD format
        const date = new Date().toISOString().split('T')[0].replace(/-/g, '');

        // Extract original file name and extension
        const originalName = req.file.originalname;
        const fileExtension = path.extname(originalName);
        const baseName = path.basename(originalName, fileExtension);
        
        // Generate new file name with date included
        const newFileName = `${baseName}_${date}${fileExtension}`;
        
        // Construct file path
        const filePath = path.join(__dirname, '../uploads/news', newFileName);
        
        // Write file to the path
        fs.writeFileSync(filePath, req.file.buffer);
        
        // Generate URL of the image
        // Adjust the URL path based on your server configuration
        image = `/uploads/news/${newFileName}`;
    }

    // Create a new news article
    const newNews = new News({ ...data, image });
    await newNews.save();

    return responseHandler(res, 201, "New news article created successfully!", newNews);
};

/****************************************************************************************************/
/*                                    Function to edit news                                        */
/****************************************************************************************************/

// Edit an existing news article
exports.editNews = async (req, res) => {
    const { newsId } = req.params;
    const data = req.body;

    if (!newsId) {
        return responseHandler(res, 400, "Invalid request");
    }

    // Validate the input data
    const { error } = NewsSchema.validate(data, {
        abortEarly: true
    });

    if (error) {
        return responseHandler(res, 400, `Invalid input: ${error.message}`);
    }

    const news = await News.findById(newsId);

    if (!news) {
        return responseHandler(res, 404, "News article not found");
    }

    // Handle file upload if present
    let image = news.image;
    if (req.file) {
        // Delete old image
        if (news.image) {
            deleteFile(path.join(__dirname, '../uploads/news', news.image));
        }

        // Get current date in YYYYMMDD format
        const date = new Date().toISOString().split('T')[0].replace(/-/g, '');

        // Extract original file name and extension
        const originalName = req.file.originalname;
        const fileExtension = path.extname(originalName);
        const baseName = path.basename(originalName, fileExtension);
        
        // Generate new file name with date included
        const newFileName = `${baseName}_${date}${fileExtension}`;
        
        // Construct file path
        const filePath = path.join(__dirname, '../uploads/news', newFileName);
        
        // Write file to the path
        fs.writeFileSync(filePath, req.file.buffer);
        
        // Generate URL of the image
        // Adjust the URL path based on your server configuration
        image = `/uploads/news/${newFileName}`;
    }

    // Update the news article
    Object.assign(news, data, { image });
    await news.save();

    return responseHandler(res, 200, "News article updated successfully!", news);
};

/****************************************************************************************************/
/*                                  Function to get all news articles                               */
/****************************************************************************************************/

// Get all news articles
exports.getAllNews = async (req, res) => {
    const news = await News.find();
    return responseHandler(res, 200, "News articles retrieved successfully", news);
};

/****************************************************************************************************/
/*                                 Function to get news article by id                               */
/****************************************************************************************************/

// Get news article by ID
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

// Delete a news article
exports.deleteNews = async (req, res) => {
    const { newsId } = req.params;

    if (!newsId) {
        return responseHandler(res, 400, "Invalid request");
    }

    const news = await News.findByIdAndDelete(newsId);

    if (!news) {
        return responseHandler(res, 404, "News article not found");
    }

    // Delete the associated image file if it exists
    if (news.image) {
        deleteFile(path.join(__dirname, '../uploads/news', news.image));
    }

    return responseHandler(res, 200, "News article deleted successfully");
};
