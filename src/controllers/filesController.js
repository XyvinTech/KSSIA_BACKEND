require("dotenv").config();
const responseHandler = require("../helpers/responseHandler");
const handleFileUpload = require("../utils/fileHandler");
const listFilesInBucket = require("../utils/listFilesInBucket");
const deleteFile = require("../helpers/deleteFiles");
const path = require('path');

const Event = require("../models/events");
const User = require("../models/user");
const Product = require("../models/products");
const News = require("../models/news");
const Promotion = require("../models/promotions");
const Notification = require("../models/notifications");
const Messages = require("../models/messages");
const Payment = require("../models/payment");
const Requirements = require("../models/requirements");

/****************************************************************************************************/
/*                                   Function to upload files                                       */
/****************************************************************************************************/

exports.uploadImages = async (req, res) => {
    // Handle file upload if present
    let image = '';
    const bucketName = process.env.AWS_S3_BUCKET;
    if (req.file) {
        try {
            image = await handleFileUpload(req.file, bucketName);
        } catch (err) {
            return responseHandler(res, 500, err.message);
        }
        return responseHandler(res, 200, "File uploaded successfully", image);
    }
}

/****************************************************************************************************/
/*                                 Get all files in AWS S3 bucket                                   */
/****************************************************************************************************/

exports.getFiles = async (req, res) => {
    const bucketName = process.env.AWS_S3_BUCKET;

    try {
        const files = await listFilesInBucket(bucketName);
        return responseHandler(res, 200, "Files retrieved successfully", files);
    } catch (err) {
        return responseHandler(res, 500, err.message);
    }
};

/****************************************************************************************************/
/*                                 Get all files in AWS S3 bucket                                   */
/****************************************************************************************************/

exports.deleteFile = async (req, res) => {
    const bucketName = process.env.AWS_S3_BUCKET;
    const fileKey = req.params.fileKey; // The file key to delete is passed via URL

    try {
        await deleteFile(bucketName, fileKey);
        return responseHandler(res, 200, "File deleted successfully");
    } catch (err) {
        if( err.message == "File not found"){
            return responseHandler(res, 404, "File not found");
        }
        return responseHandler(res, 500, err.message);
    }
};

exports.checkFiles = async (req, res) => {
    const events = await Event.find();
    const users = await User.find();
    const products = await Product.find();
    const news = await News.find();
    const promotions = await Promotion.find();
    const notifications = await Notification.find();
    const messages = await Messages.find();
    const payments = await Payment.find();
    const requirements = await Requirements.find();

    // Get all files linked with AWS S3 BUCKET
    const bucketName = process.env.AWS_S3_BUCKET;
    const files = await listFilesInBucket(bucketName);

    // Get files that are linked to any model
    let linkedFiles = [];

    // Collect URLs from all models
    users.forEach(user => {
        if (user.profile_picture) linkedFiles.push(user.profile_picture);
        if (user.company_logo) linkedFiles.push(user.company_logo);
        user.awards.forEach(award => { if (award.url) linkedFiles.push(award.url); });
        user.certificates.forEach(certificate => { if (certificate.url) linkedFiles.push(certificate.url); });
        user.brochure.forEach(item => { if (item.url) linkedFiles.push(item.url); });
    });

    requirements.forEach(requirement => {
        if (requirement.image) linkedFiles.push(requirement.image);
    });

    promotions.forEach(promotion => {
        if (promotion.banner_image_url) linkedFiles.push(promotion.banner_image_url);
        if (promotion.poster_image_url) linkedFiles.push(promotion.poster_image_url);
    });

    products.forEach(product => {
        if (product.image) linkedFiles.push(product.image);
    });

    payments.forEach(payment => {
        if (payment.invoice_url) linkedFiles.push(payment.invoice_url);
    });

    notifications.forEach(notification => {
        if (notification.media_url) linkedFiles.push(notification.media_url);
        if (notification.file_url) linkedFiles.push(notification.file_url);
    });

    news.forEach(newsItem => {
        if (newsItem.image) linkedFiles.push(newsItem.image);
    });

    messages.forEach(message => {
        message.attachments.forEach(attachment => {
            if (attachment.url) linkedFiles.push(attachment.url);
        });
    });

    events.forEach(event => {
        if (event.image) linkedFiles.push(event.image);
        if (event.guest_image) linkedFiles.push(event.guest_image);
        event.speakers.forEach(speaker => {
            if (speaker.speaker_image) linkedFiles.push(speaker.speaker_image);
        });
    });

    // Convert linked file URLs to just the file names (ignoring folder paths)
    const linkedFileKeys = linkedFiles
        .filter(link => typeof link === 'string') // Ensure link is a valid string
        .map(link => path.basename(link));

    // Get files that need to be deleted (those not present in linkedFileKeys)
    const filesToDelete = files.filter(file => {
        const fileKey = typeof file.key === 'string' ? path.basename(file.key) : null;
        return fileKey && !linkedFileKeys.includes(fileKey);
    });

    // Ensure filenames are case-insensitive if needed:
    const normalizedLinkedFileKeys = linkedFileKeys.map(file => file.toLowerCase());
    const normalizedFilesToDelete = filesToDelete.map(file => file.key.toLowerCase());

    const response = {
        FilesLinked: linkedFileKeys,
        UnlinkedFiles: filesToDelete,
        Total_no_of_files: files.length,
        No_of_linked_files: linkedFileKeys.length,
        No_of_trash_files: filesToDelete.length,
        No_of_files_in_bucket_after_deletion: files.length - filesToDelete.length,
    };

    return responseHandler(res, 200, "File check successfully completed", response);
};
