const Fuse = require('fuse.js');
const responseHandler = require("../helpers/responseHandler");
const User = require("../models/user");
const {
    CreateUserSchema,
    EditUserSchema,
} = require("../validation");

// Function to generate a 6-digit OTP
const generateOTP = (length = 6) => {
    const otp = Math.floor(100000 + Math.random() * 900000);
    return otp.toString().substring(0, length);
};
  
// Mock function to send OTP (replace with actual implementation)
const sendOtp = async (mobile, otp) => {
    console.log(`Sending OTP ${otp} to mobile number ${mobile}`);
    // Simulate sending OTP
    return { status: "success" }; // Replace with actual status from your SMS service
};

// Function to sent OTP for login
exports.sendOtp = async (req, res) => {
    try {
        const { mobile } = req.params;

        // Validate the presence of the mobile field in the request body
        if (!mobile) {
            return responseHandler(res, 400, "Mobile number is required");
        }
  
        // Check if the user exists in the database
        const user = await User.findOne({ "phone_numbers.personal": mobile });
        if (!user) {
            return responseHandler(res, 404, "User not found");
        }

        // Generate a 6-digit OTP
        const otp = generateOTP(6);

        // Send the OTP to the user's mobile number
        const sendOtpFn = await sendOtp(mobile, otp);

        // If OTP is not sent successfully
        if (sendOtpFn.status !== "success") {
            return responseHandler(res, 400, "Failed to sent OTP");
        }
        
        user.otp = otp;
        await user.save();
        return responseHandler(res, 200, "OTP sent successfully");
        
    } catch (error) {
        return responseHandler(res, 500, `Internal Server Error ${error.message}`);
    }
};
  
// Function to verify the OTP for login
exports.verifyOtp = async (req, res) => {
    try {
        const { mobile, otp } = req.body;

        // Validate the presence of the mobile and otp fields in the request body
        if (!mobile || !otp) {
            return responseHandler(res, 400, "Mobile number and OTP are required");
        }

        // Check if the user exists in the database
        const user = await User.findOne({ "phone_numbers.personal": mobile });
        if (!user) {
            return responseHandler(res, 404, "User not found");
        }

        // Check if the OTP recived and the OTP in the database of the user is same
        if (user.otp !== otp) {
            return responseHandler(res, 400, "Invalid OTP");
        }
        user.otp = null;
        await user.save();
        return responseHandler(res, 200, "User verified successfully");

    } catch (error) {
        return responseHandler(res, 500, `Internal Server Error ${error.message}`);
    }
};

// // Function to edit the user profile
// exports.editProfile = async (req, res) => {
//     try {

//         // Validate the input data
//         const {error} = EditUserSchema.validate(req.body, {abortEarly: true});

//         // Check if an error exist in the validation
//         if (error) {
//             return responseHandler(res, 400, `Invalid input: ${error.message}`);
//         }

//         // Find the user by their ID
//         const user = await User.findById(req.params.id);
//         if (!user) {
//             return responseHandler(res, 404, "User not found");
//         }

//         // Update the user's profile with the validated data
//         Object.assign(user, req.body);

//         // Save the updated user record
//         await user.save();

//         return responseHandler(res, 200, "User profile updated successfully", user);

//     } catch (error) {
//         return responseHandler(res, 500, `Internal Server Error ${error.message}`);
//     }
// };

// Function to edit the user profile
exports.editProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const data = req.body;

        // Validate the presence of the userId in the request body
        if(!userId){
            return responseHandler(res, 400, "Requires user id to update the data");
        }

        // Validate the input data
        const {error} = EditUserSchema.validate(data, {abortEarly: true});

        // Check if an error exist in the validation
        if (error) {
            return responseHandler(res, 400, `Invalid input: ${error.message}`);
        }

        // Update the user's profile with the validated data
        const updatedUser = await User.findByIdAndUpdate(userId, data, { new: true, runValidators: true });
        if (!updatedUser) {
            return responseHandler(res, 404, "User not found");
        }
        return responseHandler(res, 200, "User profile updated successfully", updatedUser);

    } catch (error) {
        return responseHandler(res, 500, `Internal Server Error ${error.message}`);
    }
};

// Function to search users using name aggregation and fuse.js
exports.findUserByName = async (req, res) => {
    try {
        const { name } = req.params;
        // console.log(`Received name parameter: ${name}`);                                 // Debug line

        // Validate the presence of the name in the request parameter
        if (!name) {
            return responseHandler(res, 400, "Requires name to find the user");
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

    } catch (error) {
        // console.error(`Internal Server Error: ${error.message}`);                        // Debug line
        return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
    }
};

// Function to get user using membership ID
exports.findUserByMembershipId = async (req,res) => {
    try {
        const { membershipId } = req.params;

        // Check if the membership id is present in the request
        if (!membershipId) {
            return responseHandler(res, 400, "Membership ID is required");
        }

        // Check if the membership id exist in the database
        const user = await User.findOne({ membershipId });
        if (!user) {
            return responseHandler(res, 404, "User not found");
        }
        return responseHandler(res, 200, "User found", user);

    } catch (error) {
        return responseHandler(res, 500, `Internal Server Error ${error.message}`);
    }
}

exports.register = (req, res) => {
    res.send("register");
};