require("dotenv").config();
const path = require('path');
const responseHandler = require("../helpers/responseHandler");
const deleteFile = require("../helpers/deleteFiles");
const Payment = require("../models/payment");
const User = require("../models/user");
const {
    PaymentSchema,
    UserPaymentSchema
} = require("../validation");
const handleFileUpload = require("../utils/fileHandler");
const sendInAppNotification = require("../utils/sendInAppNotification");

/****************************************************************************************************/
/*                                  Function to create payments                                     */
/****************************************************************************************************/
exports.createPayment = async (req, res) => {
    const data = req.body;
    const year_count = req.body.year_count ? req.body.year_count : 1

    // Validate the input data using Joi
    const { error } = PaymentSchema.validate(data, { abortEarly: true });
    if (error) {
        return responseHandler(res, 400, `Invalid input: ${error.message}`);
    }

    // Check if a payment with the same details already exists
    const paymentExist = await Payment.findOne({
        member: data.member,
        category: data.category,
        status: { $in: ['pending','accepted'] }
    });
    if (paymentExist) {
        return responseHandler(res, 400, "Payment details already exist");
    }

    let invoice_url = '';
    let renewal = '';
    let days = '';
    const bucketName = process.env.AWS_S3_BUCKET;

    // Handle file upload if a file is present
    if (req.file) {
        try {
            invoice_url = await handleFileUpload(req.file, bucketName);
        } catch (err) {
            return responseHandler(res, 500, `File upload failed: ${err.message}`);
        }
    }

    // Calculate the renewal date
    const resultDate = new Date(data.date);
    if (isNaN(resultDate.getTime())) {
        return responseHandler(res, 400, "Invalid date provided for payment");
    }
    resultDate.setDate(resultDate.getDate() + (365 * year_count)); // Adding 365 days * no of years for renewal
    renewal = resultDate;
    days = (365 * year_count);

    // Create a new payment instance
    const newPayment = new Payment({
        ...data,
        invoice_url,
        renewal,
        days
    });

    // Save the new payment to the database
    try {
        await newPayment.save();
        return responseHandler(res, 201, "Payment submitted successfully!", newPayment);
    } catch (err) {
        return responseHandler(res, 500, `Error saving payment: ${err.message}`);
    }
};


/****************************************************************************************************/
/*                                   Function to edit payments                                      */
/****************************************************************************************************/
exports.updatePayment = async (req, res) => {
    const {
        paymentID
    } = req.params;
    const data = req.body;
    const year_count = req.body.year_count ? req.body.year_count : 1

    const {
        error
    } = PaymentSchema.validate(data, {
        abortEarly: false
    });
    if (error) {
        return responseHandler(res, 400, `Invalid input: ${error.details.map(detail => detail.message).join(', ')}`);
    }

    let payment;
    try {
        payment = await Payment.findById(paymentID);
    } catch (err) {
        return responseHandler(res, 500, `Error finding payment: ${err.message}`);
    }

    if (!payment) {
        return responseHandler(res, 404, "Payment details do not exist");
    }

    let invoice_url = payment.invoice_url;
    const bucketName = process.env.AWS_S3_BUCKET;

    if (req.file) {
        try {
            if (payment.invoice_url) {
                const oldImageKey = path.basename(payment.invoice_url);
                await deleteFile(bucketName, oldImageKey);
            }
            invoice_url = await handleFileUpload(req.file, bucketName);
        } catch (err) {
            return responseHandler(res, 500, err.message);
        }
    }

    const resultDate = new Date(data.date);
    resultDate.setDate(resultDate.getDate() + (365 * year_count));
    payment.renewal = resultDate;
    payment.days = (365 * year_count);

    Object.assign(payment, data, {
        invoice_url
    });

    try {
        await payment.save();
        try{

            let user = await User.findById(payment.member);
            
            if (!user) {
                    return responseHandler(res, 404, "User not found");
            }

            if(payment.status == "accepted"){
                payment.reason = '';
            }

            try {
                if((payment.status == "accepted") && (payment.category == "app")){
                    user.subscription = payment.plan;
                    await user.save();
                }
                else if((payment.status == "accepted") && (payment.category == "membership")){
                    user.membership_status = payment.plan;
                    await user.save();
                }
            } catch (error) {
                console.log(`error updating the user subscription : ${error}`);
            }
    
            try {
    
                let userFCM = [];
                userFCM.push(user.fcm);
                
                const subject = `${payment.category} subscription status update`;
                let content = `Your payment for ${payment.category} has been ${payment.status}`.trim();
        
                if((payment.reason != "") && (payment.reason != undefined)){
                    content = `Your payment for ${payment.category} has been ${payment.status} beacuse ${payment.reason}`.trim();
                }
        
                await sendInAppNotification(
                    userFCM,
                    subject,
                    content,
                    media=null,
                    'approvals',
                );
        
            } catch (error) {
                console.log(`error creating notification : ${error}`);
            }

        } catch (error){
            console.log(`Error featching user: ${error.message}`)
        }
        return responseHandler(res, 200, "Payment updated successfully!", payment);
    } catch (err) {
        return responseHandler(res, 500, `Error saving payment: ${err.message}`);
    }
};

/****************************************************************************************************/
/*                               Function to edit subscription                                      */
/****************************************************************************************************/
exports.updateSubs = async (req, res) => {
    const { paymentID } = req.params;
    const year_count = req.body.year_count ? req.body.year_count : 1;

    let payment;
    try {
        payment = await Payment.findById(paymentID);
    } catch (err) {
        return responseHandler(res, 500, `Error finding payment: ${err.message}`);
    }

    if (!payment) {
        return responseHandler(res, 404, "Payment details do not exist");
    }

    // Validate the current renewal date
    const renewalDate = new Date(payment.renewal);
    if (isNaN(renewalDate.getTime())) {
        return responseHandler(res, 400, "Invalid renewal date");
    }

    // Calculate the new renewal date
    renewalDate.setDate(renewalDate.getDate() + (365 * year_count));
    payment.renewal = renewalDate;
    payment.days = (365 * year_count);
    
    try {

        await payment.save();

        try{

            let user = await User.findById(payment.member);

            if (!user) {
                    return responseHandler(res, 404, "User not found");
            }

            if(payment.status == "accepted"){
                payment.reason = '';
            }

            try {
                if((payment.status == "accepted") && (payment.category == "app")){
                    user.subscription = payment.plan;
                    await user.save();
                }
            } catch (error) {
                console.log(`error updating the user subscription : ${error}`);
            }
    
            try {
    
                let userFCM = [];
                userFCM.push(user.fcm);
                
                const subject = `${payment.category} subscription status update`;
                let content = `Your subscription for ${payment.category} has been updated to ${payment.renewal}`.trim();
        
                await sendInAppNotification(
                    userFCM,
                    subject,
                    content,
                    media=null,
                    'approvals',
                );
        
            } catch (error) {
                console.log(`error creating notification : ${error}`);
            }

        } catch (error){
            console.log(`Error featching user: ${error.message}`)
        }

        return responseHandler(res, 200, "Payment updated successfully!", payment);
    } catch (err) {
        return responseHandler(res, 500, `Error saving payment: ${err.message}`);
    }
};

/****************************************************************************************************/
/*                                  Function to get all payments                                     */
/****************************************************************************************************/
exports.getAllPayments = async (req, res) => {
    const { pageNo = 1, limit = 10 } = req.query;
    const skipCount = limit * (pageNo - 1);
  
    try {
      // Count total payments for pagination
      const totalCount = await Payment.countDocuments();
  
      // Fetch payments with pagination and populate member details
      const payments = await Payment.find()
        .populate({ path: "member", select: "name membership_id" })
        .skip(skipCount)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean()
        .exec();
  
      // Check if no payments were found
      if (payments.length === 0) {
        return responseHandler(res, 404, "No payments found");
      }
  
      // Map the payments and include member's full name
      const mappedPayments = payments.map((payment) => {
        return {
          ...payment, // Spread the original payment data
          full_name: `${payment.member?.name.first_name || ''} ${payment.member?.name.middle_name || ''} ${payment.member?.name.last_name || ''}`.trim(), // Construct full name
        };
      });
  
      // Send response with mapped payments and total count
      return responseHandler(res, 200, "Successfully retrieved all payments", mappedPayments, totalCount);
    } catch (err) {
      return responseHandler(res, 500, `Error retrieving payments: ${err.message}`);
    }
  };  

/****************************************************************************************************/
/*                                  Function to get payment by id                                   */
/****************************************************************************************************/
exports.getPaymentById = async (req, res) => {
    const {
        paymentID
    } = req.params;

    try {
        const payment = await Payment.findById(paymentID)
        .populate({ path: "member", select: "name membership_id" })
        .exec();
        if (!payment) {
            return responseHandler(res, 404, "Payment not found");
        }
        
        // Construct full name from the member's details
        const full_name = `${payment.member?.name.first_name || ''} ${payment.member?.name.middle_name || ''} ${payment.member?.name.last_name || ''}`.trim();

        // Add full_name to the payment object
        const responsePayment = {
            ...payment.toObject(), // Convert payment to a plain object
            full_name // Add the constructed full name
        };

        return responseHandler(res, 200, "Successfully retrieved payment", responsePayment);
        
    } catch (err) {
        return responseHandler(res, 500, `Error retrieving payment: ${err.message}`);
    }
};

/****************************************************************************************************/
/*                                  Function to delete payments                                     */
/****************************************************************************************************/
exports.deletePayment = async (req, res) => {
    const {
        paymentID
    } = req.params;

    const payment = await Payment.findById(paymentID);
    if (!payment) {
        return responseHandler(res, 404, "Payment details do not exist");
    }

    const bucketName = process.env.AWS_S3_BUCKET;

    if (payment.invoice_url) {
        try {
            const oldImageKey = path.basename(payment.invoice_url);
            await deleteFile(bucketName, oldImageKey);
        } catch (err) {
            return responseHandler(res, 500, `Error deleting file: ${err.message}`);
        }
    }

    await Payment.findByIdAndDelete(paymentID);

    return responseHandler(res, 200, "Payment deleted successfully");
};

/****************************************************************************************************/
/*                             Function to update status of payments                                */
/****************************************************************************************************/
exports.updatePaymentStatus = async (req, res) => {
    const {
        paymentID
    } = req.params;
    const {
        status,
        reason
    } = req.body;

    const validStatuses = ["pending", "accepted", "resubmit", "rejected"];
    if (!validStatuses.includes(status)) {
        return responseHandler(res, 400, "Invalid status value");
    }

    let payment = await Payment.findById(paymentID);
    if (!payment) {
        return responseHandler(res, 404, "Payment details do not exist");
    }

    payment.status = status;
    payment.reason = reason;

   try {

        await payment.save();

        try{

            let user = await User.findById(payment.member);
            
            if (!user) {
                    return responseHandler(res, 404, "User not found");
            }

            if(status == "accepted"){
                payment.reason = '';
            }

            try {
                if((payment.status == "accepted") && (payment.category == "app")){
                    user.subscription = payment.plan;
                    await user.save();
                }
            } catch (error) {
                console.log(`error updating the user subscription : ${error}`);
            }
    
            try {
    
                let userFCM = [];
                userFCM.push(user.fcm);
                
                const subject = `${payment.category} subscription status update`;
                let content = `Your payment for ${payment.category} has been ${payment.status}`.trim();
        
                if((payment.reason != "") && (payment.reason != undefined)){
                    content = `Your payment for ${payment.category} has been ${payment.status} beacuse ${payment.reason}`.trim();
                }
        
                await sendInAppNotification(
                    userFCM,
                    subject,
                    content,
                    media=null,
                    'approvals',
                );
        
            } catch (error) {
                console.log(`error creating notification : ${error}`);
            }

        } catch (error){
            console.log(`Error featching user: ${error.message}`)
        }

        return responseHandler(res, 200, "Payment status updated successfully", payment);
    } catch (err) {
        return responseHandler(res, 500, `Error saving payment: ${err.message}`);
    }
};

/****************************************************************************************************/
/*                             Function to get users payments history                               */
/****************************************************************************************************/
exports.getUserPayments = async (req, res) => {

    const { userId } = req.params;

    const { pageNo = 1, limit = 10 } = req.query;
    const skipCount = limit * (pageNo - 1);

    if (!userId) {
        return responseHandler(res, 400, "Invalid request");
    }

    const user = await User.findById(userId);
    if (!user) {
        return responseHandler(res, 404, "User not found");
    }

    const totalCount = await Payment.find({ member: userId });
    const payments = await Payment.find({ member: userId })
        .skip(skipCount)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean()
        .exec();

    if (payments.length === 0) {
        return responseHandler(res, 404, "No payments found");
    }

    return responseHandler(res, 200, "Successfully retrieved payments", payments, totalCount);
};

/****************************************************************************************************/
/*                         Function to create user payment (subscription)                           */
/****************************************************************************************************/
exports.createUserPayment = async (req, res) => {
    const userId = req.userId;
    const data = req.body;

    if (!userId) {
        return responseHandler(res, 400, "Invalid request");
    }

    const user = await User.findById(userId);
    if (!user) {
        return responseHandler(res, 404, "User not found");
    }

    const {
        error
    } = UserPaymentSchema.validate(data, {
        abortEarly: true
    });

    const payment_exist = await Payment.findOne(
        {
            category: data.category,
            member: userId,
            status: { $in: ['pending', 'accepted', 'expiring'] }
        }
    )

    if (payment_exist){
        return responseHandler(res, 400, "Payment already exist");
    }

    if (error) {
        return responseHandler(res, 400, `Invalid input: ${error.message}`);
    }

    let invoice_url = '';
    const bucketName = process.env.AWS_S3_BUCKET;
    if (req.file) {
        try {
            invoice_url = await handleFileUpload(req.file, bucketName);
        } catch (err) {
            return responseHandler(res, 500, err.message);
        }
    }

    const newPayment = new Payment({
        ...data,
        invoice_url,
        member: userId
    });

    try {
        await newPayment.save();
        return responseHandler(res, 201, "Payment submitted successfully!", newPayment);
    } catch (err) {
        return responseHandler(res, 500, `Error saving payment: ${err.message}`);
    }
}

/****************************************************************************************************/
/*                       Function to get users Subscription Active                                  */
/****************************************************************************************************/
exports.getUserSubscriptionActive = async (req, res) => {

    const {
        userId
    } = req.params;

    if (!userId) {
        return responseHandler(res, 400, "Invalid request");
    }

    const subscriptionsActive = await Payment.find(
        {
            member:userId,
            status: { $in: ['pending','accepted', 'expiring']}
        }
    );
    if (!subscriptionsActive) {
        return responseHandler(res, 404, "No pending or active subscriptions found");
    }
    return responseHandler(res, 200, "Subscriptions found", subscriptionsActive);
};

/****************************************************************************************************/
/*               Function to get users Subscription Active for app purpose                          */
/****************************************************************************************************/
exports.getUserSubscriptionActiveApp = async (req, res) => {
    const { userId } = req.params;
  
    if (!userId) {
        return responseHandler(res, 400, "Invalid request");
    }
  
    try {
        const subscriptionsActive = await Payment.find({
            member: userId,
            status: { $in: ['pending', 'accepted', 'expiring', 'expired'] },
        }).sort({ createdAt: -1 });
  
        // Structure the response
        const structuredResponse = {
            Membership: null,
            App: null,
        };
  
        if (!subscriptionsActive || subscriptionsActive.length === 0) {
            return responseHandler(res, 200, "No pending or active subscriptions found", structuredResponse);
        }
  
        let appSubscriptionStatus = null; // To track the highest-priority app status ("pending" or "accepted")
        let membershipSubscriptionStatus = null; // To track the highest-priority membership status ("pending" or "accepted")
  
        subscriptionsActive.forEach((subscription) => {
            const { category, status, date, renewal } = subscription;
  
            // Modify the structure based on category (membership or app)
            if (category === "membership") {
                // Priority is: accepted > pending > expired for membership
                if (status === "accepted" || status == "expiring") {
                    membershipSubscriptionStatus = "accepted"; // Set to status if found
                    // Set the lastRenewed and nextRenewal dates for membership
                    structuredResponse.Membership = {
                        lastRenewed: date,
                        nextRenewal: renewal,
                        status: membershipSubscriptionStatus, // Set the final status after the loop
                    };
                } else if (status === "pending" && (membershipSubscriptionStatus !== "accepted" && membershipSubscriptionStatus !== "expiring")) {
                    membershipSubscriptionStatus = "pending"; // Set to "pending" if no "accepted" is found
                    // Set the lastRenewed and nextRenewal dates for membership
                    structuredResponse.Membership = {
                        lastRenewed: date,
                        nextRenewal: renewal,
                        status: membershipSubscriptionStatus, // Set the final status after the loop
                    };
                } else if (status === "expired" && !membershipSubscriptionStatus) {
                    if (!structuredResponse.Membership || new Date(createdAt) > new Date(structuredResponse.Membership.lastRenewed)) {
                        membershipSubscriptionStatus = "expired"; // Set to "expired" if no "accepted" or "pending" is found
                        // Set the lastRenewed and nextRenewal dates for the latest expired membership
                        structuredResponse.Membership = {
                            lastRenewed: date,
                            nextRenewal: renewal,
                            status: membershipSubscriptionStatus, // Set the final status after the loop
                        };
                    }
                }
            } else if (category === "app") {
                // Priority is: accepted > pending > expired for app
                if (status === "accepted" || status == "expiring") {
                    appSubscriptionStatus = "accepted"; // Set to "accepted" if found
                } else if (status === "pending" && (appSubscriptionStatus !== "accepted" &&  appSubscriptionStatus !== "expiring") ) {
                    appSubscriptionStatus = "pending"; // Set to "pending" if no "accepted" is found
                } else if (status === "expired" && !appSubscriptionStatus) {
                    appSubscriptionStatus = "expired"; // Set to "expired" if no "accepted" or "pending" found
                }
  
                // Set the app status in the structured response
                structuredResponse.App = {
                    status: appSubscriptionStatus, // Set the final status after the loop
                };
            }
        });
  
        return responseHandler(res, 200, "Subscriptions found", structuredResponse);
    } catch (error) {
        return responseHandler(res, 500, "Internal Server Error", error.message);
    }
};
  