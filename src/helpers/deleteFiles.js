const fs = require('fs').promises;

/**
 * Helper function to handle file deletion
 * @param {string} filePath - The path of the file to delete
 * @returns {Promise<void>}
 */
const deleteFile = async (filePath) => {
    try {
        await fs.unlink(filePath);
    } catch (err) {
        console.error('Error deleting file:', err);
        throw err; // Optional: rethrow the error if you want it to be handled by the caller
    }
};

module.exports = deleteFile;
