const path = require('path');
const fs = require('fs').promises;

const handleFileUpload = async (file, directory) => {
    try {
        // Get current date in YYYYMMDD format
        const date = new Date().toISOString().split('T')[0].replace(/-/g, '');

        // Extract original file name and extension
        const originalName = file.originalname;
        const fileExtension = path.extname(originalName);
        const baseName = path.basename(originalName, fileExtension);

        // Generate new file name with date included
        const newFileName = `${baseName}_${date}${fileExtension}`;

        // Construct file path
        const filePath = path.join(directory, newFileName);

        // Ensure the directory exists
        await fs.mkdir(path.dirname(filePath), { recursive: true });

        // Write file to the path
        await fs.writeFile(filePath, file.buffer);

        // Generate URL of the file
        return `/uploads${filePath.split('uploads')[1]}`;
    } catch (err) {
        throw new Error(`Error handling file upload: ${err.message}`);
    }
};

module.exports = handleFileUpload;
