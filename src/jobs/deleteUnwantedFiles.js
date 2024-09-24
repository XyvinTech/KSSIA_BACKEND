const cron = require("node-cron");
const path = require('path');

const listFilesInBucket = require("../utils/listFilesInBucket");
const deleteFile = require("../helpers/deleteFiles");

const Event = require("../models/events");
const User = require("../models/user");
const Product = require("../models/products");
const News = require("../models/news");
const Promotion = require("../models/promotions");
const Notification = require("../models/notifications");
const Messages = require("../models/messages");
const Payment = require("../models/payment");
const Requirements = require("../models/requirements");

require("dotenv").config();

// Define the cron job to run every sundays
cron.schedule("0 0 * * 0", async () => {

    try {
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

        users.forEach(user => {
            // Add profile picture URL
            if (user.profile_picture) {
                linkedFiles.push(user.profile_picture);
            }
            // Add company logo URL
            if (user.company_logo) {
                linkedFiles.push(user.company_logo);
            }

            // Add award URLs
            user.awards.forEach(award => {
                if (award.url) {
                    linkedFiles.push(award.url);
                }
            });

            // Add certificate URLs
            user.certificates.forEach(certificate => {
                if (certificate.url) {
                    linkedFiles.push(certificate.url);
                }
            });

            // Add brochure URLs
            user.brochure.forEach(item => {
                if (item.url) {
                    linkedFiles.push(item.url);
                }
            });
        });

        requirements.forEach(requirement => {
            // Add requirement URLs
            if (requirement.image) {
                linkedFiles.push(requirement.image);
            }
        });

        promotions.forEach(promotion => {
            // Add banner image URLs
            if (promotion.banner_image_url) {
                linkedFiles.push(promotion.banner_image_url);
            }

            // Add poster image URLs
            if (promotion.poster_image_url) {
                linkedFiles.push(promotion.poster_image_url);
            }
        });

        products.forEach(product => {
            // Add product image URLs
            if (product.image) {
                linkedFiles.push(product.image);
            }
        });

        payments.forEach(payment => {
            // Add payment invoice URLs  
            if (payment.invoice_url) {
                linkedFiles.push(payment.invoice_url);
            }
        });

        notifications.forEach(notification => {
            // Add notification media URLs
            if (notification.media_url) {
                linkedFiles.push(notification.media_url);
            }

            // Add notification file URLs
            if (notification.file_url) {
                linkedFiles.push(notification.file_url);
            }
        });

        news.forEach(news => {
            // Add news image URLs
            if (news.image) {
                linkedFiles.push(news.image);
            }
        });

        messages.forEach(message => {
            // Add message attachment URLs
            message.attachments.forEach(attachment => {
                if (attachment.url) {
                    linkedFiles.push(attachment.url);
                }
            });
        });

        events.forEach(event => {
            // Add event image URLs
            if (event.image) {
                linkedFiles.push(event.image);
            }

            // Add event guest image URLs 
            if (event.guest_image) {
                linkedFiles.push(event.guest_image);
            }

            // Add event speakers image URLs
            event.speakers.forEach(speaker => {
                if (speaker.speaker_image) {
                    linkedFiles.push(speaker.speaker_image);
                }
            });
        });

        const linkedFileKeys = [];
        const filesToDelete = [];

        for (const link of linkedFiles) {
            const fileKey = path.basename(link);
            linkedFileKeys.push(fileKey);
        };

        for (const file of files) {
            if (!linkedFileKeys.includes(file)) {
                // If the file is not linked, add it to the list of files to be deleted
                filesToDelete.push(file);
            }
        };

        let count = 0;

        filesToDelete.forEach(async fileKey => {
            // Delete the file
            trash = await deleteFile(bucketName, fileKey);
            if (!trash) {
                console.log(`Unable to delete File ${fileKey}`);
            } else {
                console.log(`File ${fileKey} deleted successfully`);
                count += 1;
            }
        });

        console.log(`Total no of files detected in bucket ${files.length}`);
        console.log(`No of linked files detected ${linkedFileKeys.length}`);
        console.log(`No of files to be deleted ${filesToDelete.length}`);
        console.log(`No of files deleted ${count}`);
        console.log(`No of files in bucket after deletion ${files.length - count}`);

    } catch (err) {
        console.error("Error performing check:", err);
    }
});