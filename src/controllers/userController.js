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


exports.register = (req, res) => {
    res.send("register");
};