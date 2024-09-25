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
        if (err.message == "File not found") {
            return responseHandler(res, 404, "File not found");
        }
        return responseHandler(res, 500, err.message);
    }
};

exports.checkFiles = async (req, res) => {
    // Batch sizing the query
    const batchSize = 100;

    async function processModelInBatches(Model, processFunc) {
        let currentPage = 0;
        let results;

        do {
            // Fetch a batch of results using pagination
            results = await Model.find().skip(currentPage * batchSize).limit(batchSize);
            await Promise.all(results.map(processFunc)); // Process each result in parallel
            currentPage++;
        } while (results.length > 0); // Continue while there are still results to process
    }

    async function gatherLinkedFiles() {
        const linkedFiles = [];

        // Process users and their file links
        await processModelInBatches(User, user => {
            // Add profile picture URL
            if (user.profile_picture) linkedFiles.push(user.profile_picture);

            // Add company logo URL
            if (user.company_logo) linkedFiles.push(user.company_logo);

            // Add award URLs
            user.awards.forEach(award => {
                if (award.url) linkedFiles.push(award.url);
            });

            // Add certificate URLs
            user.certificates.forEach(cert => {
                if (cert.url) linkedFiles.push(cert.url);
            });

            // Add brochure URLs
            user.brochure.forEach(item => {
                if (item.url) linkedFiles.push(item.url);
            });
        });

        // Process requirements and their image URLs
        await processModelInBatches(Requirements, req => {
            // Add requirement URLs
            if (req.image) linkedFiles.push(req.image);
        });

        // Process promotions and their file links
        await processModelInBatches(Promotion, promo => {
            // Add banner image URLs
            if (promo.banner_image_url) linkedFiles.push(promo.banner_image_url);

            // Add poster image URLs
            if (promo.poster_image_url) linkedFiles.push(promo.poster_image_url);
        });

        // Process products and their image URLs
        await processModelInBatches(Product, product => {
            // Add product image URLs
            if (product.image) linkedFiles.push(product.image);
        });

        // Process payments and their invoice URLs
        await processModelInBatches(Payment, payment => {
            // Add payment invoice URLs  
            if (payment.invoice_url) linkedFiles.push(payment.invoice_url);
        });

        // Process notifications and their media and file URLs
        await processModelInBatches(Notification, notification => {
            // Add notification media URLs
            if (notification.media_url) linkedFiles.push(notification.media_url);

            // Add notification file URLs
            if (notification.file_url) linkedFiles.push(notification.file_url);
        });

        // Process news and their image URLs
        await processModelInBatches(News, news => {
            // Add news image URLs
            if (news.image) linkedFiles.push(news.image);
        });

        // Process messages and their attachment URLs
        await processModelInBatches(Messages, message => {
            message.attachments.forEach(attachment => {
                // Add message attachment URLs
                if (attachment.url) linkedFiles.push(attachment.url);
            });
        });

        // Process events and their image URLs
        await processModelInBatches(Event, event => {
            // Add event image URLs
            if (event.image) linkedFiles.push(event.image);

            // Add event guest image URLs 
            if (event.guest_image) linkedFiles.push(event.guest_image);

            // Add event speakers' image URLs
            event.speakers.forEach(speaker => {
                if (speaker.speaker_image) linkedFiles.push(speaker.speaker_image);
            });
        });

        return linkedFiles;
    }

    try {
        const bucketName = process.env.AWS_S3_BUCKET;
        const files = await listFilesInBucket(bucketName);

        // Gather linked files from all models
        const linkedFiles = await gatherLinkedFiles();
        const linkedFileKeys = linkedFiles.map(link => path.basename(link));
        const filesToDelete = files.filter(file => !linkedFileKeys.includes(file));

        const response = {
            FilesLinked: linkedFileKeys,
            UnlinkedFiles: filesToDelete,
            Total_no_of_files: files.length,
            No_of_linked_files: linkedFileKeys.length,
            No_of_trash_files: filesToDelete.length,
            No_of_files_in_bucket_after_deletion: files.length - filesToDelete.length,
        };

        return responseHandler(res, 200, "File check successfully completed", response);
    } catch (err) {
        console.error("Error performing check:", err);
    }
};