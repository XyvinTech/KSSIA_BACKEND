const Fuse = require('fuse.js');
const responseHandler = require("../helpers/responseHandler");
const User = require("../models/user");
const {
    CreateUserSchema,
    EditUserSchema,
} = require("../validation");

/****************************************************************************************************/
/*                               Function to generate a 6-digit OTP                                 */
/****************************************************************************************************/

const generateOTP = (length = 6) => {
    const otp = Math.floor(100000 + Math.random() * 900000);
    return otp.toString().substring(0, length);
};
  
/****************************************************************************************************/
/*                 Mock function to send OTP (replace with actual implementation)                   */
/****************************************************************************************************/

const sendOtp = async (mobile, otp) => {
    console.log(`Sending OTP ${otp} to mobile number ${mobile}`);
    // Simulate sending OTP
    return { status: "success" }; // Replace with actual status from your SMS service
};

/****************************************************************************************************/
/*                                 Function to sent OTP for login                                   */
/****************************************************************************************************/

exports.sendOtp = async (req, res) => {

    const { mobile } = req.params;
    // console.log(`Received mobile parameter: ${mobile}`);                             // Debug line

    // Validate the presence of the mobile field in the request body
    if (!mobile) {
        // console.log(`Mobile number is required`);                                    // Debug line
        return responseHandler(res, 400, "Invalid request");
    }
  
    // Check if the user exists in the database
    const user = await User.findOne({ "phone_numbers.personal": mobile });
    if (!user) {
        // console.log(`User not found`);                                               // Debug line
        return responseHandler(res, 404, "User not found");
    }

    // Generate a 6-digit OTP
    const otp = generateOTP(6);

    // Send the OTP to the user's mobile number
    const sendOtpFn = await sendOtp(mobile, otp);

    // If OTP is not sent successfully
    if (sendOtpFn.status !== "success") {
        // console.log(`Failed to send OTP`);                                           // Debug line
        return responseHandler(res, 400, "Failed to sent OTP");
    }
        
    user.otp = otp;
    await user.save();
    // console.log(`OTP sent successfully`);                                            // Debug line
    return responseHandler(res, 200, "OTP sent successfully");
        
};
  
/****************************************************************************************************/
/*                              Function to verify the OTP for login                                */
/****************************************************************************************************/

exports.verifyOtp = async (req, res) => {
    
    const { mobile, otp } = req.body;
    // console.log(`Received mobile and OTP parameters: ${mobile} ${otp}`);             // Debug line

    // Validate the presence of the mobile and otp fields in the request body
    if (!mobile || !otp) {
        // console.log(`Mobile and OTP are required`);                                  // Debug line
        return responseHandler(res, 400, "Invalid request");
    }

    // Check if the user exists in the database
    const user = await User.findOne({ "phone_numbers.personal": mobile });
    if (!user) {
        // console.log(`User not found`);                                               // Debug line
        return responseHandler(res, 404, "User not found");
    }

    // Check if the OTP recived and the OTP in the database of the user is same
    if (user.otp !== otp) {
        // console.log(`Invalid OTP`);                                                  // Debug line
        return responseHandler(res, 400, "Invalid OTP");
    }
    user.otp = null;
    await user.save();
    // console.log(`OTP verified successfully`);                                        // Debug line
    return responseHandler(res, 200, "User OTP verified successfully");

};

/****************************************************************************************************/
/*                               Function to edit the user profile                                  */
/****************************************************************************************************/

// exports.editProfile = async (req, res) => {

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

// };

/****************************************************************************************************/
/*                               Function to edit the user profile                                  */
/****************************************************************************************************/

exports.editProfile = async (req, res) => {
    
    const { userId } = req.params;
    const data = req.body;
    // console.log(`Received userId parameter: ${userId}`);                             // Debug line
    // console.log(`Received body parameter: ${data}`);                                 // Debug line

    // Validate the presence of the userId in the request body
    if(!userId){
        // console.log(`Requires user id to update the data`);                          // Debug line
        return responseHandler(res, 400, "Invalid request");
    }

    // Validate the input data
    const {error} = EditUserSchema.validate(data, {abortEarly: true});

    // Check if an error exist in the validation
    if (error) {
        // console.log(`Error validating the data: ${error.message}`);                  // Debug line
        return responseHandler(res, 400, `Invalid input: ${error.message}`);
    }

    // Fetch current user data
    const currentUser = await User.findById(userId);
    if (!currentUser) {
        return responseHandler(res, 404, "User not found");
    }
    
    // Update the user's profile with the validated data
    const updatedUser = await User.findByIdAndUpdate(userId, data, { new: true, runValidators: true });
    if (!updatedUser) {
        // console.log(`User not found`);                                               // Debug line
        return responseHandler(res, 404, "User not found");
    }

    // Update products if any changes exist in the data
    // Check for product changes
    if (data.products) {
        // Fetch current products for the user
        const currentProducts = await Product.find({ seller_id: userId });
        // console.log(`Current products: ${currentProducts}`);                         // Debug line
        // console.log(`Data products: ${data.products}`);                              // Debug line
    
        // Convert current products to a map for easier comparison
        const currentProductsMap = new Map(currentProducts.map(product => [product._id.toString(), product]));
        // console.log(`Current products map: ${currentProductsMap}`);                  // Debug line

        for (let productData of data.products) {
            // If the product contains an ID update the product in the database else add the  
            if (productData._id) {
                // Update existing products
                const existingProduct = currentProductsMap.get(productData._id);
                if (existingProduct) {
                    await Product.findByIdAndUpdate(productData._id, productData, { new: true, runValidators: true });
                    currentProductsMap.delete(productData._id);
                } else {
                    // console.log(`Product not found with the Id provided`);           // Debug line
                    return responseHandler(res, 404, "Invalid request");
                }
            } else {
                // Add new products
                const newProduct = new Product({ ...productData, seller_id: userId });
                await newProduct.save();
                // console.console.log(`Product added successfully! ${newProduct}`);                   // Debug line
            }
        }
    
        // Remove products that were not in the update request
        for (let remainingProduct of currentProductsMap.values()) {
            await Product.findByIdAndDelete(remainingProduct._id);
        }
    }

    // console.log(`User profile updated successfully`);                                // Debug line
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