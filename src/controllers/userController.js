require("dotenv").config();
const Fuse = require('fuse.js');
const path = require('path');
const handleFileUpload = require("../utils/fileHandler");
const deleteFile = require("../helpers/deleteFiles");
const responseHandler = require("../helpers/responseHandler");
const User = require("../models/user");

const { CreateUserSchema, EditUserSchema } = require("../validation");


exports.editProfile = async (req, res) => {
    const { userId } = req.params;
    const data = req.body;

    // Validate the presence of the userId in the request body
    if (!userId) {
        return responseHandler(res, 400, "Invalid request");
    }

    // Validate the input data
    const { error } = EditUserSchema.validate(data, { abortEarly: true });

    // Check if an error exists in the validation
    if (error) {
        return responseHandler(res, 400, `Invalid input: ${error.message}`);
    }

    // Fetch current user data
    const currentUser = await User.findById(userId);
    if (!currentUser) {
        return responseHandler(res, 404, "User not found");
    }

    const bucketName = process.env.AWS_S3_BUCKET;

    // Handle deletion of old files if new URLs are provided
    const fieldsToCheck = ['awards', 'certificates', 'brochure'];
    for (const field of fieldsToCheck) {
        if (data[field]) {
            for (const item of currentUser[field]) {
                const isStillPresent = data[field].some(newItem => newItem.url === item.url);
                if (!isStillPresent && item.url) {
                    let oldFileKey = path.basename(item.url);
                    await deleteFile(bucketName, oldFileKey);
                }
            }
        }
    }

    // Update the user's profile with the validated data
    const updatedUser = await User.findByIdAndUpdate(userId, data, { new: true, runValidators: true });

    if (!updatedUser) {
        return responseHandler(res, 404, "User not found");
    }

    // Update products if any changes exist in the data
    if (data.products) {
        const currentProducts = await Product.find({ seller_id: userId });
        const currentProductsMap = new Map(currentProducts.map(product => [product._id.toString(), product]));

        for (let productData of data.products) {
            if (productData._id) {
                const existingProduct = currentProductsMap.get(productData._id);
                if (existingProduct) {
                    await Product.findByIdAndUpdate(productData._id, productData, { new: true, runValidators: true });
                    currentProductsMap.delete(productData._id);
                } else {
                    return responseHandler(res, 404, "Invalid request");
                }
            } else {
                const newProduct = new Product({ ...productData, seller_id: userId });
                await newProduct.save();
            }
        }

        // Remove products that were not in the update request, and delete associated images
        for (let remainingProduct of currentProductsMap.values()) {
            if (remainingProduct.image) {
                let oldImageKey = path.basename(remainingProduct.image);
                await deleteFile(bucketName, oldImageKey);
            }
            await Product.findByIdAndDelete(remainingProduct._id);
        }
    }

    return responseHandler(res, 200, "User profile updated successfully", updatedUser);
};

/****************************************************************************************************/
/*                  Function to search users using name aggregation and fuse.js                     */
/****************************************************************************************************/

exports.findUserByName = async (req, res) => {

    const { name } = req.params;
    // console.log(`Received name parameter: ${name}`);                                 // Debug line

    // Validate the presence of the name in the request parameter
    if (!name) {
        // console.log(`Requires name to search the user`);                             // Debug line
        return responseHandler(res, 400, "Invalid request");
    }

    // Decode URL encoded spaces
    const decodedName = decodeURIComponent(name);
    // console.log(`Decoded Name: ${decodedName}`);                                     // Debug line

    // Split the name into parts
    const nameParts = decodedName.split(' ').filter(Boolean);
    // console.log(`Name Parts: ${nameParts}`);                                         // Debug line

    // Prepare the match query
    let matchQuery = {};
    if (nameParts.length > 0) {
        matchQuery = {
            $or: [
                { 'name.first_name': { $regex: nameParts[0], $options: 'i' } },
                { 'name.middle_name': { $regex: nameParts.slice(1, -1).join(' '), $options: 'i' } },
                { 'name.last_name': { $regex: nameParts[nameParts.length - 1], $options: 'i' } }
            ]
        };
    }
    // console.log(`Match Query: ${JSON.stringify(matchQuery)}`);                       // Debug line

    // Find users using aggregation
    const initialResults = await User.aggregate([
        { $match: matchQuery }
    ]);
    // console.log(`Initial Results: ${JSON.stringify(initialResults)}`);               // Debug line

    // Check if initial results are empty
    if (!initialResults || initialResults.length === 0) {
        // console.log('No users found in aggregation stage');                          // Debug line
        return responseHandler(res, 404, "User not found");
    }

    // Set up Fuse.js options
    const fuseOptions = {
        keys: ['name.first_name', 'name.middle_name', 'name.last_name'],
        threshold: 0.7  // Adjust as needed
    };
    // console.log(`Fuse.js Options: ${JSON.stringify(fuseOptions)}`);                  // Debug line
    // Create Fuse instance
    const fuse = new Fuse(initialResults, fuseOptions);

    // Search for users
    const fuseResults = fuse.search(decodedName);
    // console.log(`Fuse.js Results: ${JSON.stringify(fuseResults)}`);                  // Debug line
    const matchedUsers = fuseResults.map(result => result.item);
    // console.log(`Matched Users: ${JSON.stringify(matchedUsers)}`);                   // Debug line

    if (!matchedUsers || matchedUsers.length === 0) {
        // console.log('No users found in Fuse.js stage');                              // Debug line
        return responseHandler(res, 404, "User not found");
    }

    // console.log('Users successfully found and returned');                            // Debug line
    return responseHandler(res, 200, "User found", matchedUsers);

};

/****************************************************************************************************/
/*                            Function to get user using membership ID                              */
/****************************************************************************************************/

exports.findUserByMembershipId = async (req,res) => {

    const { membershipId } = req.params;
    // console.log(`Received membershipId parameter: ${membershipId}`);                 // Debug line

    // Check if the membership id is present in the request
    if (!membershipId) {
        // console.log('Membership ID is required');                                    // Debug line
        return responseHandler(res, 400, "Invalid request");
    }

    // Check if the membership id exist in the database
    const user = await User.findOne({ membershipId });
    if (!user) {
        // console.log('User not found in database');                                   // Debug line
        return responseHandler(res, 404, "User not found");
    }
    // console.log('User found in database');                                           // Debug line
    return responseHandler(res, 200, "User found", user);

}

exports.register = (req, res) => {
    res.send("register");
};