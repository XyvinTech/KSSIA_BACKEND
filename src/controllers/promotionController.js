require("dotenv").config();
const responseHandler = require("../helpers/responseHandler");
const Promotion = require("../models/promotions");
const {
    EditPromotionSchema
} = require("../validation");
const handleFileUpload = require("../utils/fileHandler");
const deleteFile = require("../helpers/deleteFiles");
const path = require('path');

/****************************************************************************************************/
/*                                    Function to create promotion                                  */
/****************************************************************************************************/

exports.createPromotion = async (req, res) => {

    const data = req.body;

    // Validate the input data
    const {
        error
    } = EditPromotionSchema.validate(data, {
        abortEarly: true
    });
    if (error) return responseHandler(res, 400, `Invalid input: ${error.message}`);

    if (data.type !== 'banner'){

        // Check if a promotion with the same data already exists
        const promotionExist = await Promotion.findOne({
            type: data.type,
            startDate: data.startDate,
            endDate: data.endDate,

            ...data.type === 'video' && {
                yt_link: data.yt_link,
                video_title: data.video_title
            },
            ...data.type === 'notice' && {
                notice_title: data.notice_title,
                notice_description: data.notice_description,
                notice_link: data.notice_link
            }
        });

        if (promotionExist) return responseHandler(res, 400, "Promotion already exists");
    }

    // Handle file upload if present
    const bucketName = process.env.AWS_S3_BUCKET;
    let banner_image_url = '';
    let upload_video = '';
    let poster_image_url = '';

    if (req.file) {
        if (data.type === 'banner') {
            banner_image_url = await handleFileUpload(req.file, bucketName);
        } else if (data.type === 'video') {
            upload_video = await handleFileUpload(req.file, bucketName);
        } else if (data.type === 'poster') {
            poster_image_url = await handleFileUpload(req.file, bucketName);
        }
    }

    // Create a new promotion
    const newPromotion = new Promotion({
        ...data,
        banner_image_url,
        upload_video,
        poster_image_url
    });

    try {
        await newPromotion.save();
    } catch (err) {
        return responseHandler(res, 500, `Error adding promotion: ${err.message}`);
    }

    return responseHandler(res, 201, "New promotion created successfully!", newPromotion);

};

/****************************************************************************************************/
/*                                    Function to edit promotion                                   */
/****************************************************************************************************/

exports.editPromotion = async (req, res) => {

    const {
        promotionId
    } = req.params;
    const data = req.body;

    if (!promotionId) return responseHandler(res, 400, "Invalid request");

    // Validate the input data
    const {
        error
    } = EditPromotionSchema.validate(data, {
        abortEarly: true
    });
    if (error) return responseHandler(res, 400, `Invalid input: ${error.message}`);

    const promotion = await Promotion.findById(promotionId);

    if (!promotion) return responseHandler(res, 404, "Promotion not found");
    // Handle file upload if present
    const bucketName = process.env.AWS_S3_BUCKET;
    let banner_image_url = promotion.banner_image_url;
    let upload_video = promotion.upload_video;
    let poster_image_url = promotion.poster_image_url;
    try {

        if (req.file) {
            // Delete old file
            if (promotion.type === 'banner' && promotion.banner_image_url) {
                let oldImageKey = path.basename(promotion.banner_image_url);
                await deleteFile(bucketName, oldImageKey);
            } else if (promotion.type === 'video' && promotion.upload_video) {
                let oldImageKey = path.basename(promotion.upload_video);
                await deleteFile(bucketName, oldImageKey);
            } else if (promotion.type === 'poster' && promotion.poster_image_url) {
                let oldImageKey = path.basename(promotion.poster_image_url);
                await deleteFile(bucketName, oldImageKey);
            }

            // Handle new file upload
            if (data.type === 'banner') {
                banner_image_url = await handleFileUpload(req.file, bucketName);
            } else if (data.type === 'video') {
                upload_video = await handleFileUpload(req.file, bucketName);
            } else if (data.type === 'poster') {
                poster_image_url = await handleFileUpload(req.file, bucketName);
            }
        }
    } catch (err) {
        return responseHandler(res, 500, `Error updating file: ${err.message}`);
    }

    try {
        // Update the promotion
        Object.assign(promotion, data, {
            banner_image_url,
            upload_video,
            poster_image_url
        });
        await promotion.save();
    } catch (err) {
        return responseHandler(res, 500, `Error updating promotion: ${err.message}`);
    }

    return responseHandler(res, 200, "Promotion updated successfully!", promotion);
};

/****************************************************************************************************/
/*                                  Function to get all promotions                                  */
/****************************************************************************************************/

exports.getAllPromotions = async (req, res) => {
    const promotions = await Promotion.find();
    return responseHandler(res, 200, "Promotions retrieved successfully", promotions);
};

/****************************************************************************************************/
/*                              Function to get all promotions by type                              */
/****************************************************************************************************/

exports.getPromotionsByType = async (req, res) => {
    const type = req.params.type;
    const types = ['banner', 'video', 'poster', 'notice'];
    if (!type || (!types.some(type))) return responseHandler(res, 400, "Invalid request");
    const promotions = await Promotion.find({ type: type });
    return responseHandler(res, 200, "Promotions retrieved successfully", promotions);
};

/****************************************************************************************************/
/*                                Function to get promotion by id                                  */
/****************************************************************************************************/

exports.getPromotionById = async (req, res) => {

    const {
        promotionId
    } = req.params;

    if (!promotionId) return responseHandler(res, 400, "Invalid request");

    const promotion = await Promotion.findById(promotionId);

    if (!promotion) return responseHandler(res, 404, "Promotion not found");

    return responseHandler(res, 200, "Promotion retrieved successfully", promotion);

};

/****************************************************************************************************/
/*                                  Function to delete promotion                                    */
/****************************************************************************************************/

exports.deletePromotion = async (req, res) => {

    const {
        promotionId
    } = req.params;

    if (!promotionId) return responseHandler(res, 400, "Invalid request");

    const promotion = await Promotion.findById(promotionId);

    if (!promotion) return responseHandler(res, 404, "Promotion not found");

    try {
        // Delete the associated file if it exists
        const bucketName = process.env.AWS_S3_BUCKET;
        if (promotion.type === 'banner' && promotion.banner_image_url) {
            let oldImageKey = path.basename(promotion.banner_image_url);
            await deleteFile(bucketName, oldImageKey);
        } else if (promotion.type === 'video' && promotion.upload_video) {
            let oldImageKey = path.basename(promotion.upload_video);
            await deleteFile(bucketName, oldImageKey);
        } else if (promotion.type === 'poster' && promotion.poster_image_url) {
            let oldImageKey = path.basename(promotion.poster_image_url);
            await deleteFile(bucketName, oldImageKey);
        }
    } catch (err) {
        return responseHandler(res, 500, `Error deleting file: ${err.message}`);
    }

    try {
        await Promotion.findByIdAndDelete(promotionId);
    } catch (err) {
        return responseHandler(res, 500, `Error deleting promotion: ${err.message}`);
    }

    return responseHandler(res, 200, "Promotion deleted successfully");
};