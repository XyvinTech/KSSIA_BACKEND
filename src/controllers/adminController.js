const responseHandler = require("../helpers/responseHandler");
const User = require("../models/user");
const { CreateUserSchema, EditUserSchema } = require("../validations");

// Create a new user
exports.createUser = async (req, res) => {
    try {
        const data = req.body;

        // Validate the input data
        const { error } = CreateUserSchema.validate(data, {
            abortEarly: true
        });

        // Check if an error exists in the validation
        if (error) {
            return responseHandler(res, 400, `Invalid input: ${error.message}`);
        }

        // Check if a user with this mobile number already exists
        const existingUser = await User.findOne({
            'phone_numbers.personal': data.phone_numbers.personal
        });
        if (existingUser) {
            return responseHandler(res, 409, `User with this phone number already exists`);
        }

        // Create a new user
        const newUser = new User(data);
        await newUser.save();

        return responseHandler(res, 201, `New user created successfully!`, newUser);
    } catch (error) {
        console.error(error);
        return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
    }
};

// Edit User
exports.editUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const data = req.body;

        // Validate the input data
        const { error } = EditUserSchema.validate(data, {
            abortEarly: true
        });

        // Check if an error exists in the validation
        if (error) {
            return responseHandler(res, 400, `Invalid input: ${error.message}`);
        }

        // Find and update the user
        const updatedUser = await User.findByIdAndUpdate(userId, data, { new: true, runValidators: true });

        if (!updatedUser) {
            return responseHandler(res, 404, "User not found");
        }

        return responseHandler(res, 200, "User updated successfully!", updatedUser);

    } catch (error) {
        console.error(error);
        return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
    }
};

// Get All Users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        return responseHandler(res, 200, "Users retrieved successfully", users);
    } catch (error) {
        console.error(error);
        return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
    }
};


// Delete an user 
exports.deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { membership_id } = req.params;
        if(userId){
            const user = await User.findByIdAndDelete(userId);
            if (!user) {
                return responseHandler(res, 404, "User not found");
            }
        }
        else if(membership_id){
            const user = await User.findOneAndDelete(membership_id);
            if (!user) {
                return responseHandler(res, 404, "User not found");
            }
        }
        else{
            return responseHandler(res, 400, `Invalid input: ${error.message}`);
        }
        return responseHandler(res, 200, "User deleted successfully");
    } catch (error) {
        console.error(error);
        return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
    }
};