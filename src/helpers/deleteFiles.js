const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');
require("dotenv").config();

// Initialize S3 client
const s3 = new S3Client({ region: process.env.AWS_REGION });

/**
 * Helper function to delete a file from AWS S3
 * @param {string} bucketName - The name of the S3 bucket
 * @param {string} fileKey - The key (file name) of the file to delete
 * @returns {Promise<void>}
 */

const deleteFile = async (bucketName, fileKey) => {
    try {
        const params = {
            Bucket: bucketName,
            Key: fileKey,
        };

        // Delete file from S3
        await s3.send(new DeleteObjectCommand(params));
    } catch (err) {
        console.error('Error deleting file from S3:', err);
        throw err; // Optional: rethrow the error if you want it to be handled by the caller
    }
};

module.exports = deleteFile;
