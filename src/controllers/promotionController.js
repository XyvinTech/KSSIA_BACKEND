const responseHandler = require("../helpers/responseHandler");
const Promotion = require("../models/promotions");
const { EditPromotionSchema } = require("../validation");
const handleFileUpload = require("../utils/fileHandler");
const deleteFile = require("../helpers/deleteFiles");
const path = require('path');

/****************************************************************************************************/
/*                                    Function to create promotion                                  */
/****************************************************************************************************/

exports.createPromotion = async (req, res) => {
    try {
        const data = req.body;

        // Validate the input data
        const { error } = EditPromotionSchema.validate(data, { abortEarly: true });
        if (error) return responseHandler(res, 400, `Invalid input: ${error.message}`);

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

        if (promotionExist) return responseHandler(res, 400, "Promotion already exists");

        // Handle file upload if present
        let banner_image_url = '';
        let upload_video = '';
        let poster_image_url = '';

        if (req.file) {
            const uploadDir = path.join(__dirname, '../uploads/promotions');
            
            if (data.type === 'banner') {
                banner_image_url = handleFileUpload(req.file, uploadDir);
            } else if (data.type === 'video') {
                upload_video = handleFileUpload(req.file, uploadDir);
            } else if (data.type === 'poster') {
                poster_image_url = handleFileUpload(req.file, uploadDir);
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
    } catch (err) {
        return responseHandler(res, 500, `Internal server error: ${err.message}`);
    }
};

/****************************************************************************************************/
/*                                    Function to edit promotion                                   */
/****************************************************************************************************/

exports.editPromotion = async (req, res) => {
    try {
        const { promotionId } = req.params;
        const data = req.body;

        if (!promotionId) return responseHandler(res, 400, "Invalid request");

        // Validate the input data
        const { error } = EditPromotionSchema.validate(data, { abortEarly: true });
        if (error) return responseHandler(res, 400, `Invalid input: ${error.message}`);

        const promotion = await Promotion.findById(promotionId);

        if (!promotion) return responseHandler(res, 404, "Promotion not found");

        // Handle file upload if present
        let banner_image_url = promotion.banner_image_url;
        let upload_video = promotion.upload_video;
        let poster_image_url = promotion.poster_image_url;

        if (req.file) {
            const uploadDir = path.join(__dirname, '../uploads/promotions');
            
            // Delete old file
            if (promotion.type === 'banner' && promotion.banner_image_url) {
                deleteFile(path.join(uploadDir, promotion.banner_image_url.split('/uploads/promotions/')[1]));
            } else if (promotion.type === 'video' && promotion.upload_video) {
                deleteFile(path.join(uploadDir, promotion.upload_video.split('/uploads/promotions/')[1]));
            } else if (promotion.type === 'poster' && promotion.poster_image_url) {
                deleteFile(path.join(uploadDir, promotion.poster_image_url.split('/uploads/promotions/')[1]));
            }

            // Handle new file upload
            if (data.type === 'banner') {
                banner_image_url = handleFileUpload(req.file, uploadDir);
            } else if (data.type === 'video') {
                upload_video = handleFileUpload(req.file, uploadDir);
            } else if (data.type === 'poster') {
                poster_image_url = handleFileUpload(req.file, uploadDir);
            }
        }

        // Update the promotion
        Object.assign(promotion, data, { banner_image_url, upload_video, poster_image_url });
        await promotion.save();

        return responseHandler(res, 200, "Promotion updated successfully!", promotion);
    } catch (err) {
        return responseHandler(res, 500, `Internal server error: ${err.message}`);
    }
};

/****************************************************************************************************/
/*                                  Function to get all promotions                                  */
/****************************************************************************************************/

exports.getAllPromotions = async (req, res) => {
    try {
        const promotions = await Promotion.find();
        return responseHandler(res, 200, "Promotions retrieved successfully", promotions);
    } catch (err) {
        return responseHandler(res, 500, `Internal server error: ${err.message}`);
    }
};

/****************************************************************************************************/
/*                                Function to get promotion by id                                  */
/****************************************************************************************************/

exports.getPromotionById = async (req, res) => {
    try {
        const { promotionId } = req.params;

        if (!promotionId) return responseHandler(res, 400, "Invalid request");

        const promotion = await Promotion.findById(promotionId);

        if (!promotion) return responseHandler(res, 404, "Promotion not found");

        return responseHandler(res, 200, "Promotion retrieved successfully", promotion);
    } catch (err) {
        return responseHandler(res, 500, `Internal server error: ${err.message}`);
    }
};

/****************************************************************************************************/
/*                                  Function to delete promotion                                    */
/****************************************************************************************************/

exports.deletePromotion = async (req, res) => {
    try {
        const { promotionId } = req.params;

        if (!promotionId) return responseHandler(res, 400, "Invalid request");

        const promotion = await Promotion.findByIdAndDelete(promotionId);

        if (!promotion) return responseHandler(res, 404, "Promotion not found");

        // Delete the associated file if it exists
        const uploadDir = path.join(__dirname, '../uploads/promotions');
        
        if (promotion.type === 'banner' && promotion.banner_image_url) {
            deleteFile(path.join(uploadDir, promotion.banner_image_url.split('/uploads/promotions/')[1]));
        } else if (promotion.type === 'video' && promotion.upload_video) {
            deleteFile(path.join(uploadDir, promotion.upload_video.split('/uploads/promotions/')[1]));
        } else if (promotion.type === 'poster' && promotion.poster_image_url) {
            deleteFile(path.join(uploadDir, promotion.poster_image_url.split('/uploads/promotions/')[1]));
        }

        return responseHandler(res, 200, "Promotion deleted successfully");
    } catch (err) {
        return responseHandler(res, 500, `Internal server error: ${err.message}`);
    }
};
