const responseHandler = require("../helpers/responseHandler");
const User = require("../models/user");
const { CreateUserSchema, EditUserSchema } = require("../validation");

// Create a new user
exports.createUser = async (req, res) => {
  
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
   
};

// Edit User
exports.editUser = async (req, res) => {
    
        const { userId } = req.params;
        const { membership_id } = req.params;
        const data = req.body;

        // Validate the input data
        const { error } = EditUserSchema.validate(data, { abortEarly: true });

        // Check if an error exists in the validation
        if (error) {
            return responseHandler(res, 400, `Invalid input: ${error.message}`);
        }

        if(userId){
            // Find and update the user
            const updatedUser = await User.findByIdAndUpdate(userId, data, { new: true, runValidators: true });

            if (!updatedUser) {
                return responseHandler(res, 404, "User not found");
            }
        }
        else if(membership_id){
             // Find and update the user
             const updatedUser = await User.findOneAndUpdate(membership_id, data, { new: true, runValidators: true });

             if (!updatedUser) {
                 return responseHandler(res, 404, "User not found");
             }
        }else{
            return responseHandler(res, 400, `Invalid input: ${error.message}`);
        }

        return responseHandler(res, 200, "User updated successfully!", updatedUser);

   
};

// Delete an user 
exports.deleteUser = async (req, res) => {
   
        const { userId } = req.params;
        const { membership_id } = req.params;

        // If the parameter requested is userId or membership_id
        if(userId){
            // Find and delete the user
            const user = await User.findByIdAndDelete(userId);
            if (!user) {
                return responseHandler(res, 404, "User not found");
            }
        } else if(membership_id){
            // Find and delete the user
            const user = await User.findOneAndDelete(membership_id);
            if (!user) {
                return responseHandler(res, 404, "User not found");
            }
        } else{
            return responseHandler(res, 400, `Invalid input: ${error.message}`);
        }
        
        return responseHandler(res, 200, "User deleted successfully");
    
};

// Get All Users
exports.getAllUsers = async (req, res) => {
  
        const users = await User.find();
        return responseHandler(res, 200, "Users retrieved successfully", users);
   
};

// Get user by id 
exports.getUserById = async (req, res) => {
    
        const { userId } = req.params;
        
        // Check if a user with this id exists
        const user = await User.findById(userId);
        if (!user) {
            return responseHandler(res, 404, "User not found");
        }
        return responseHandler(res, 200, "User retrieved successfully", user);
   
};