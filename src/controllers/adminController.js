require("dotenv").config();
const responseHandler = require("../helpers/responseHandler");
const User = require("../models/user");
const handleFileUpload = require("../utils/fileHandler");
const deleteFile = require("../helpers/deleteFiles");
const { CreateUserSchema, EditUserSchema } = require("../validation");
const path = require('path')
/****************************************************************************************************/
/*                                 Function to create a new user                                    */
/****************************************************************************************************/
function modifyIncomingData(createData){
    createData.name = {
        first_name:createData.first_name,
        middle_name:createData.middle_name,
        last_name:createData.last_name,
    }
    createData.phone_numbers = {
        personal:createData.phone_number,
        landline:createData.landline,
        company_phone_number:createData.companyphone,
        whatsapp_number:createData.whatsapp_number,
        whatsapp_business_number:createData.whatsapp_business_number
    }
    delete createData.first_name
    delete createData.middle_name
    delete createData.last_name
    delete createData.phone_number
    delete createData.landline
    delete createData.companyphone
    delete createData.whatsapp_number
    delete createData.whatsapp_business_number
    delete createData.status
    // temporary delete
    delete createData.personaladdress
    return createData
}
exports.createUser = async (req, res) => {
  
    const data = req.body;
    // console.log(`Received data parameter: ${data}`);                                 // Debug line
    
    // Validate the input data
    const { error } = CreateUserSchema.validate(modifyIncomingData(data), {
        abortEarly: true
    });

    // Check if an error exists in the validation
    if (error) {
        // If an error exists, return a 400 status code with the error message
        // console.log('Invalid input: ${error.message}');                              // Debug line
        return responseHandler(res, 400, `Invalid input: ${error.message}`);
    }

    // Check if a user with this mobile number already exists
    const existingUser = await User.findOne({
        'phone_numbers.personal': data.phone_numbers.personal
    });
    if (existingUser) {
        // If a user with this mobile number already exists, return a 400 status code with the error message
        // console.log('User with this phone number already exists');                   // Debug line
        return responseHandler(res, 409, `User with this phone number already exists`);
    }

    // Create a new user
    const newUser = new User(data);
    await newUser.save();

    // console.log(`New user created: ${newUser}`);                                   // Debug line
    return responseHandler(res, 201, `New user created successfully!`, newUser);
   
};

/****************************************************************************************************/
/*                                     Function to edit user                                        */
/****************************************************************************************************/

exports.editUser = async (req, res) => {
    
    const { userId } = req.params;
    const { membership_id } = req.params;
    const data = req.body;
    // console.log(`Received userId parameter: ${userId}`);                             // Debug line
    // console.log(`Received membership_id parameter: ${membership_id}`);               // Debug line
    // console.log(`Received data parameter: ${data}`);                                 // Debug line

    // Validate the input data
    const { error } = EditUserSchema.validate(data, { abortEarly: true });

    // Check if an error exists in the validation
    if (error) {
        // If an error exists, return a 400 status code with the error message
        // console.log('Invalid input: ${error.message}');                              // Debug line
        return responseHandler(res, 400, `Invalid input: ${error.message}`);
    }

    if (userId) {
        // Find and update the user using userId
        const updatedUser = await User.findByIdAndUpdate(userId, data, { new: true, runValidators: true });

        if (!updatedUser) {
            // If the user is not found, return a 404 status code with the error message
            // console.log('User not found');                                           // Debug line
            return responseHandler(res, 404, "User not found");
        }
    } else if (membership_id) {
        // Find and update the user using membership_id
        const updatedUser = await User.findOneAndUpdate(membership_id, data, { new: true, runValidators: true });

        if (!updatedUser) {
            // If the user is not found, return a 404 status code with the error message
            // console.log('User not found');                                           // Debug line
            return responseHandler(res, 404, "User not found");
        }
    } else {
        // If neither userId nor membership_id is provided, return a 400 status code with the error
        // console.log('Invalid request');                                              // Debug line
        return responseHandler(res, 400, `Invalid request`);
    }

    // console.log('User updated successfully!');                                       // Debug line
    return responseHandler(res, 200, "User updated successfully!", updatedUser);

};

/****************************************************************************************************/
/*                                   Function to delete an user                                     */
/****************************************************************************************************/

exports.deleteUser = async (req, res) => {

    const { userId } = req.params;
    const { membership_id } = req.params;
    // console.log(`Received userId: ${userId}`);                                       // Debug line
    // console.log(`Received membership_id: ${membership_id}`);                         // Debug line
    let user;

    if (userId) {
        // Find and delete the user using userId
        user = await User.findByIdAndDelete(userId);
        if (!user) {
            // If the user is not found, return a 404 status code with the error message
            // console.log('User not found');                                           // Debug line
            return responseHandler(res, 404, "User not found");
        }
    } else if (membership_id) {
        // Find and delete the user using membership_id
        user = await User.findOneAndDelete(membership_id);
        if (!user) {
            // If the user is not found, return a 404 status code with the error message
            // console.log('User not found');                                           // Debug line
            return responseHandler(res, 404, "User not found");
        }
    } else {
        // If neither userId nor membership_id is provided, return a 400 status code with the error
        // console.log('Invalid request');                                              // Debug line
        return responseHandler(res, 400, `Invalid request`);
    }
    // Delete user's files
    if (user.profile_picture) {
        let oldFileKey = path.basename(user.profile_picture);
        await deleteFile(bucketName, oldFileKey);
    }

    if (user.certificates) {
        for (const cert of user.certificates) {
            let oldFileKey = path.basename(cert.url);
            // here bucketname is not defined
            await deleteFile(bucketName, oldFileKey);
        }
    }

    if (user.brochure) {
        for (const brochure of user.brochure) {
            let oldFileKey = path.basename(brochure.url);
            await deleteFile(bucketName, oldFileKey);
        }
    }

    if (user.awards) {
        for (const award of user.awards) {
            let oldFileKey = path.basename(award.url);
            await deleteFile(bucketName, oldFileKey);
        }
    }

    // Delete product images
    const products = await Product.find({ seller_id: userId });
    for (const product of products) {
        if (product.image_url) {
            let oldFileKey = path.basename(product.image_url);
            await deleteFile(bucketName, oldFileKey);
        }
    }

    // Delete products
    await Product.deleteMany({ seller_id: userId });

    // console.log(`User deleted successfully`);                                        // Debug line
    return responseHandler(res, 200, "User deleted successfully");

};

/****************************************************************************************************/
/*                                   Function to get all users                                      */
/****************************************************************************************************/

exports.getAllUsers = async (req, res) => {
    
    const users = (await User.find({}, {
        '_id':1,
        'name.first_name': 1,
        'name.middle_name': 1,
        'name.last_name': 1,
        'membership_id': 1,
        'company_name': 1,
        'designation': 1,
        'phone_numbers.personal': 1,
        'is_active': 1,
    }).lean()).map(user=>({
        id:user._id,
        name: `${user.name.first_name} ${user.name.middle_name || ''} ${user.name.last_name}`.trim(),
        companyname: user.company_name,
        designation: user.designation,
        phonenumber: user.phone_numbers.personal,
        status: user.is_active,
        rating: user.rating
    })); 
    // console.log(users);                                                              // Debug line
    return responseHandler(res, 200, "Users retrieved successfully", users);
   
};

/****************************************************************************************************/
/*                                   Function to get user by ID                                     */
/****************************************************************************************************/

exports.getUserById = async (req, res) => {
    
    const { userId } = req.params;
    // console.log(`Received userId: ${userId}`);                                       // Debug line
        
    if (!userId) {
        // If userId is not provided, return a 400 status code with the error message
        // console.log('Invalid request');                                              // Debug line
        return responseHandler(res, 400, `Invalid request`);
    }

    // Check if a user with this id exists
    let user = await User.findById(userId);
    if (!user) {
        // If the user is not found, return a 404 status code with the error message
        // console.log('User not found');                                               // Debug line
        return responseHandler(res, 404, "User not found");
    }
    user = user.toObject()
    const name =  `${user.name.first_name} ${user.name.middle_name || ''} ${user.name.last_name}`.trim();
    user.name = name
    user.img = user.profile_picture
    delete user.profile_picture
    user.id = user._id
    delete user._id
    user.phone = user.phone_numbers.personal
    user.company_phone_number = user.phone_numbers.company_phone_number
    // console.log(`User retrieved successfully`);                                      // Debug line
    return responseHandler(res, 200, "User retrieved successfully", user);
   
};