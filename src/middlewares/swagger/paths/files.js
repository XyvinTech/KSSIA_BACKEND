/**
 * @swagger
 * /files/upload:
 *   put:
 *     summary: Upload a file to S3 bucket
 *     description: Handles file upload to an AWS S3 bucket and returns the URL of the uploaded file.
 *     tags:
 *       - Files
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The file to be uploaded.
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "File uploaded successfully"
 *                 fileUrl:
 *                   type: string
 *                   example: "https://your-bucket-name.s3.your-region.amazonaws.com/your-file-name"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error handling file upload: an error occurred"
 */

/**
 * @swagger
 * /files:
 *   get:
 *     summary: Get all files in S3 bucket
 *     description: Returns a list of all files stored in the S3 bucket.
 *     tags:
 *       - Files
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of files in the bucket retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Files retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 *                     example: "file1.txt"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error retrieving files from S3"
 */

/**
 * @swagger
 * /files/delete/{fileKey}:
 *   delete:
 *     summary: Delete a file from S3 bucket
 *     description: Deletes a file from the AWS S3 bucket based on the provided file key.
 *     tags:
 *       - Files
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: fileKey
 *         in: path
 *         required: true
 *         description: The key (file name) of the file to delete
 *         schema:
 *           type: string
 *           example: "file1.txt"
 *     responses:
 *       200:
 *         description: File deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "File deleted successfully"
 *       404:
 *         description: File not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "File not found in the bucket"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error deleting file from S3"
 */
