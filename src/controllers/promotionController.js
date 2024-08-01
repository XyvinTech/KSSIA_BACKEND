const responseHandler = require("../helpers/responseHandler");
const Promotion = require("../models/promotions");
const { EditPromotionSchema } = require("../validation");
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
/*                                    Function to create promotion                                  */
/****************************************************************************************************/

// Create a new promotion
exports.createPromotion = async (req, res) => {
    const data = req.body;

    // Validate the input data
    const { error } = EditPromotionSchema.validate(data, {
        abortEarly: true
    });

    // Check if an error exists in the validation
    if (error) {
        return responseHandler(res, 400, `Invalid input: ${error.message}`);
    }

    // Check if a promotion with the same data already exists
    const promotionExist = await Promotion.findOne({
        type: data.type,
        startDate: data.startDate,
        endDate: data.endDate,
        ...data.type === 'banner' && { banner_image_url: data.banner_image_url },
        ...data.type === 'video' && { upload_video: data.upload_video, yt_link: data.yt_link, video_title: data.video_title },
        ...data.type === 'poster' && { poster_image_url: data.poster_image_url },
        ...data.type === 'notice' && { notice_title: data.notice_title, notice_description: data.notice_description, notice_link: data.notice_link }
    });

    if (promotionExist) {
        return responseHandler(res, 400, "Promotion already exists");
    }

    // Handle file upload if present
    let banner_image_url = '';
    let upload_video = '';
    let poster_image_url = '';

    if (req.file) {
        const filePath = path.join(__dirname, '../uploads/promotion', req.file.originalname);
        fs.writeFileSync(filePath, req.file.buffer);

        if (data.type === 'banner') {
            banner_image_url = req.file.originalname;
        } else if (data.type === 'video') {
            upload_video = req.file.originalname;
        } else if (data.type === 'poster') {
            poster_image_url = req.file.originalname;
        }
    }

    // Create a new promotion
    const newPromotion = new Promotion({
        ...data,
        banner_image_url,
        upload_video,
        poster_image_url
    });

    await newPromotion.save();

    return responseHandler(res, 201, "New promotion created successfully!", newPromotion);
};

/****************************************************************************************************/
/*                                    Function to edit promotion                                   */
/****************************************************************************************************/

// Edit an existing promotion
exports.editPromotion = async (req, res) => {
    const { promotionId } = req.params;
    const data = req.body;

    if (!promotionId) {
        return responseHandler(res, 400, "Invalid request");
    }

    // Validate the input data
    const { error } = EditPromotionSchema.validate(data, {
        abortEarly: true
    });

    if (error) {
        return responseHandler(res, 400, `Invalid input: ${error.message}`);
    }

    const promotion = await Promotion.findById(promotionId);

    if (!promotion) {
        return responseHandler(res, 404, "Promotion not found");
    }

    // Handle file upload if present
    let banner_image_url = promotion.banner_image_url;
    let upload_video = promotion.upload_video;
    let poster_image_url = promotion.poster_image_url;

    if (req.file) {
        // Delete old image/video
        if (promotion.type === 'banner' && promotion.banner_image_url) {
            deleteFile(path.join(__dirname, '../uploads/promotion', promotion.banner_image_url));
        } else if (promotion.type === 'video' && promotion.upload_video) {
            deleteFile(path.join(__dirname, '../uploads/promotion', promotion.upload_video));
        } else if (promotion.type === 'poster' && promotion.poster_image_url) {
            deleteFile(path.join(__dirname, '../uploads/promotion', promotion.poster_image_url));
        }

        const filePath = path.join(__dirname, '../uploads/promotion', req.file.originalname);
        fs.writeFileSync(filePath, req.file.buffer);

        if (data.type === 'banner') {
            banner_image_url = req.file.originalname;
        } else if (data.type === 'video') {
            upload_video = req.file.originalname;
        } else if (data.type === 'poster') {
            poster_image_url = req.file.originalname;
        }
    }

    // Update the promotion
    Object.assign(promotion, data, { banner_image_url, upload_video, poster_image_url });
    await promotion.save();

    return responseHandler(res, 200, "Promotion updated successfully!", promotion);
};

/****************************************************************************************************/
/*                                  Function to get all promotions                                  */
/****************************************************************************************************/

// Get all promotions
exports.getAllPromotions = async (req, res) => {
    const promotions = await Promotion.find();
    return responseHandler(res, 200, "Promotions retrieved successfully", promotions);
};

/****************************************************************************************************/
/*                                Function to get promotion by id                                  */
/****************************************************************************************************/

// Get promotion by ID
exports.getPromotionById = async (req, res) => {
    const { promotionId } = req.params;

    if (!promotionId) {
        return responseHandler(res, 400, "Invalid request");
    }

    const promotion = await Promotion.findById(promotionId);

    if (!promotion) {
        return responseHandler(res, 404, "Promotion not found");
    }

    return responseHandler(res, 200, "Promotion retrieved successfully", promotion);
};

/****************************************************************************************************/
/*                                  Function to delete promotion                                    */
/****************************************************************************************************/

// Delete a promotion
exports.deletePromotion = async (req, res) => {
    const { promotionId } = req.params;

    if (!promotionId) {
        return responseHandler(res, 400, "Invalid request");
    }

    const promotion = await Promotion.findByIdAndDelete(promotionId);

    if (!promotion) {
        return responseHandler(res, 404, "Promotion not found");
    }

    // Delete the associated file if it exists
    if (promotion.type === 'banner' && promotion.banner_image_url) {
        deleteFile(path.join(__dirname, '../uploads/promotion', promotion.banner_image_url));
    } else if (promotion.type === 'video' && promotion.upload_video) {
        deleteFile(path.join(__dirname, '../uploads/promotion', promotion.upload_video));
    } else if (promotion.type === 'poster' && promotion.poster_image_url) {
        deleteFile(path.join(__dirname, '../uploads/promotion', promotion.poster_image_url));
    }

    return responseHandler(res, 200, "Promotion deleted successfully");
};
