const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');
require("dotenv").config();

// Initialize S3 client
const s3 = new S3Client({ region: process.env.AWS_REGION });

/**
 * Function to list all files in the S3 bucket
 * @param {string} bucketName - The name of the S3 bucket
 * @returns {Promise<Array>} - Array of file keys
 */

const listFilesInBucket = async (bucketName) => {
    try {
        const params = {
            Bucket: bucketName,
        };

        const data = await s3.send(new ListObjectsV2Command(params));

        if (!data.Contents || data.Contents.length === 0) {
            throw new Error('No files found in the bucket.');
        }

        // Return an array of file keys
        const fileKeys = data.Contents.map(file => file.Key);
        return fileKeys;
    } catch (err) {
        console.error('Error listing files from S3:', err);
        throw err; // Re-throw the error to handle it later
    }
};

module.exports = listFilesInBucket;
