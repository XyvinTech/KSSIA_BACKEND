const { S3Client, DeleteObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
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
        // Check if fileKey exists and is not an empty string
        if (!fileKey || fileKey.trim() === '') {
            console.warn('No file key provided, skipping deletion.');
            return;
        }

        // Check if the file exists in the S3 bucket using HeadObjectCommand
        const headParams = {
            Bucket: bucketName,
            Key: fileKey,
        };

        try {
            await s3.send(new HeadObjectCommand(headParams));
        } catch (err) {
            if (err.name === 'NotFound') {
                console.error('File not found in S3:', fileKey);
                throw new Error('File not found');
            }
            throw err; // Re-throw other unexpected errors
        }

        // Proceed to delete the file
        const deleteParams = {
            Bucket: bucketName,
            Key: fileKey,
        };

        await s3.send(new DeleteObjectCommand(deleteParams));
        console.log(`File with key ${fileKey} deleted successfully from S3.`);

    } catch (err) {
        console.error('Error deleting file from S3:', err);
        throw err; // Optional: rethrow the error if you want it to be handled by the caller
    }
};

module.exports = deleteFile;
