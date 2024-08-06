const responseHandler = require("../helpers/responseHandler");
const User = require("../models/user");
const { CreateUserSchema, EditUserSchema } = require("../validation");

/****************************************************************************************************/
/*                                 Function to create a new user                                    */
/****************************************************************************************************/

exports.createUser = async (req, res) => {
  
    const data = req.body;
    // console.log(`Received data parameter: ${data}`);                                 // Debug line

    // Validate the input data
    const { error } = CreateUserSchema.validate(data, {
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
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            // If the user is not found, return a 404 status code with the error message
            // console.log('User not found');                                           // Debug line
            return responseHandler(res, 404, "User not found");
        }
    } else if (membership_id) {
        // Find and delete the user using membership_id
        const user = await User.findOneAndDelete(membership_id);
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
    const uploadDir = path.join(__dirname, '../uploads/users');
    if (user.profile_picture) {
        await deleteFile(path.join(uploadDir, path.basename(user.profile_picture)));
    }

    if (user.certificates) {
        for (const cert of user.certificates) {
            await deleteFile(path.join(uploadDir, path.basename(cert)));
        }
    }

    if (user.brochures) {
        for (const brochure of user.brochures) {
            await deleteFile(path.join(uploadDir, path.basename(brochure)));
        }
    }

    if (user.awards) {
        for (const award of user.awards) {
            await deleteFile(path.join(uploadDir, path.basename(award)));
        }
    }

    // Delete product images
    const products = await Product.find({ seller_id: userId });
    for (const product of products) {
        if (product.image_url) {
            await deleteFile(path.join(uploadDir, path.basename(product.image_url)));
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
  
    const users = await User.find();
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
    const user = await User.findById(userId);
    if (!user) {
        // If the user is not found, return a 404 status code with the error message
        // console.log('User not found');                                               // Debug line
        return responseHandler(res, 404, "User not found");
    }

    // console.log(`User retrieved successfully`);                                      // Debug line
    return responseHandler(res, 200, "User retrieved successfully", user);
   
};