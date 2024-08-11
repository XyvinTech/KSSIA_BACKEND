const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const path = require('path');
const crypto = require('crypto');
require("dotenv").config();

// Initialize S3 client
const s3 = new S3Client({ region: process.env.AWS_REGION });

const handleFileUpload = async (file, bucketName) => {
    try {
        // Get current date in YYYYMMDD format
        const date = new Date().toISOString().split('T')[0].replace(/-/g, '');

        // Extract original file name and extension
        const originalName = file.originalname;
        const fileExtension = path.extname(originalName);
        const baseName = path.basename(originalName, fileExtension);

        // Generate a unique identifier to avoid collisions
        const uniqueId = crypto.randomBytes(16).toString('hex');

        // Generate new file name with date and unique ID included
        const newFileName = `${baseName}_${date}_${uniqueId}${fileExtension}`;

        // Define S3 upload parameters
        const params = {
            Bucket: bucketName,
            Key: newFileName,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: 'public-read', // Set file permission
        };

        // Upload file to S3
        await s3.send(new PutObjectCommand(params));

        // Generate URL of the file
        const fileUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${newFileName}`;

        return fileUrl;
    } catch (err) {
        throw new Error(`Error handling file upload: ${err.message}`);
    }
};

module.exports = handleFileUpload;
