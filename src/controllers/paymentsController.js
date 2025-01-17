require("dotenv").config();
const path = require("path");
const responseHandler = require("../helpers/responseHandler");
const deleteFile = require("../helpers/deleteFiles");
const Payment = require("../models/payment");
const User = require("../models/user");
const {
  PaymentSchema,
  UserPaymentSchema,
  createParentSubSchema,
  editParentSubSchema,
} = require("../validation");
const handleFileUpload = require("../utils/fileHandler");
const sendInAppNotification = require("../utils/sendInAppNotification");
const ParentSub = require("../models/parentSub");

/****************************************************************************************************/
/*                                  Function to create payments                                     */
/****************************************************************************************************/
exports.createPayment = async (req, res) => {
  const { error } = PaymentSchema.validate(req.body, { abortEarly: true });
  if (error) {
    return responseHandler(res, 400, `Invalid input: ${error.message}`);
  }

  const newPayment = await Payment.create(req.body);

  if (!newPayment) {
    return responseHandler(res, 500, "Error saving payment");
  } else {
    if (req.body.category === "app") {
      await User.findOneAndUpdate(
        { _id: req.body.user },
        { subscription: "premium" },
        { new: true }
      );
    } else if (req.body.category === "membership") {
      await User.findOneAndUpdate(
        { _id: req.body.user },
        { status: "active" },
        { new: true }
      );
    }
  }

  try {
    return responseHandler(
      res,
      201,
      "Payment submitted successfully!",
      newPayment
    );
  } catch (err) {
    return responseHandler(res, 500, `Error saving payment: ${err.message}`);
  }
};
/****************************************************************************************************/
/*                                   Function to edit payments                                      */
/****************************************************************************************************/
exports.updatePayment = async (req, res) => {
  try {
    const { error } = PaymentSchema.validate(req.body, { abortEarly: true });
    if (error) {
      return responseHandler(res, 400, `Invalid input: ${error.message}`);
    }
    const { id } = req.params;

    await Payment.findByIdAndUpdate(id, { status: "expired" }, { new: true });

    const payment = await Payment.create(req.body);

    if (!payment) {
      return responseHandler(res, 500, "Error saving payment");
    } else {
      if (req.body.category === "app") {
        await User.findOneAndUpdate(
          { _id: req.body.user },
          { subscription: "premium" },
          { new: true }
        );
      } else if (req.body.category === "membership") {
        await User.findOneAndUpdate(
          { _id: req.body.user },
          { status: "active" },
          { new: true }
        );
      }
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
  renewalDate.setDate(renewalDate.getDate() + 365 * year_count);
  payment.renewal = renewalDate;
  payment.days = 365 * year_count;

  try {
    await payment.save();

    try {
      let user = await User.findById(payment.member);

      if (!user) {
        return responseHandler(res, 404, "User not found");
      }

      if (payment.status == "accepted") {
        payment.reason = "";
      }

      try {
        if (payment.status == "accepted" && payment.category == "app") {
          user.subscription = payment.plan;
          await user.save();
        } else if (
          payment.status == "accepted" &&
          payment.category == "membership"
        ) {
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
        let content =
          `Your subscription for ${payment.category} has been updated to ${payment.renewal}`.trim();

        await sendInAppNotification(
          userFCM,
          subject,
          content,
          (media = null),
          "approvals"
        );
      } catch (error) {
        console.log(`error creating notification : ${error}`);
      }
    } catch (error) {
      console.log(`Error featching user: ${error.message}`);
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
  const { pageNo = 1, limit = 10, status } = req.query;
  const skipCount = limit * (pageNo - 1);

  const filter = {};

  if (status) {
    filter.status = status;
  }

  try {
    const totalCount = await Payment.countDocuments(filter);

    const payments = await Payment.find(filter)
      .populate({ path: "user", select: "name membership_id" })
      .skip(skipCount)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    if (payments.length === 0) {
      return responseHandler(res, 404, "No payments found");
    }

    const mappedPayments = payments.map((payment) => {
      return {
        ...payment,
        full_name: `${payment.user?.name || ""}`,
      };
    });

    return responseHandler(
      res,
      200,
      "Successfully retrieved all payments",
      mappedPayments,
      totalCount
    );
  } catch (err) {
    return responseHandler(
      res,
      500,
      `Error retrieving payments: ${err.message}`
    );
  }
};

/****************************************************************************************************/
/*                                  Function to get payment by id                                   */
/****************************************************************************************************/
exports.getPaymentById = async (req, res) => {
  const { paymentID } = req.params;

  try {
    const payment = await Payment.findById(paymentID)
      .populate({ path: "member", select: "name membership_id" })
      .exec();
    if (!payment) {
      return responseHandler(res, 404, "Payment not found");
    }

    // Construct full name from the member's details
    const full_name = `${payment.member?.name.first_name || ""} ${
      payment.member?.name.middle_name || ""
    } ${payment.member?.name.last_name || ""}`.trim();

    // Add full_name to the payment object
    const responsePayment = {
      ...payment.toObject(), // Convert payment to a plain object
      full_name, // Add the constructed full name
    };

    return responseHandler(
      res,
      200,
      "Successfully retrieved payment",
      responsePayment
    );
  } catch (err) {
    return responseHandler(
      res,
      500,
      `Error retrieving payment: ${err.message}`
    );
  }
};

/****************************************************************************************************/
/*                                  Function to delete payments                                     */
/****************************************************************************************************/
exports.deletePayment = async (req, res) => {
  const { paymentID } = req.params;

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
  const { paymentID } = req.params;
  const { status, category } = req.body;

  let payment = await Payment.findById(paymentID);
  if (!payment) {
    return responseHandler(res, 404, "Payment details do not exist");
  }

  try {
    let user = await User.findById(payment.user);

    if (!user) {
      return responseHandler(res, 404, "User not found");
    }
    if (status == "cancelled" && category == "app") {
      user.subscription = "free";
      payment.status = "cancelled";
    } else if (status == "cancelled" && category == "membership") {
      user.status = "inactive";
      payment.status = "cancelled";
    } else if (status == "accepted" && category == "app") {
      user.subscription = "premium";
      payment.status = "active";
    } else if (status == "accepted" && category == "membership") {
      user.status = "active";
      payment.status = "active";
    }
    await user.save();
    await payment.save();

    return responseHandler(
      res,
      200,
      "Payment status updated successfully",
      payment
    );
  } catch (err) {
    return responseHandler(res, 500, `Error saving payment: ${err.message}`);
  }
};

/****************************************************************************************************/
/*                             Function to get users payments history                               */
/****************************************************************************************************/
exports.getUserPayments = async (req, res) => {
  const { userId } = req.params;

  try {
    // Fetch the latest payment for 'app' category
    const appPayment = await Payment.findOne({ user: userId, category: "app" })
      .sort({ createdAt: -1 })
      .populate("parentSub")
      .lean();

    // Fetch the latest payment for 'membership' category
    const membershipPayment = await Payment.findOne({
      user: userId,
      category: "membership",
    })
      .sort({ createdAt: -1 })
      .populate("parentSub")
      .lean();

    // Array to hold the final results
    const payments = [];

    if (appPayment) {
      payments.push(appPayment);
    }

    if (membershipPayment) {
      payments.push(membershipPayment);
    }

    return responseHandler(
      res,
      200,
      "Successfully retrieved payments",
      payments,
      payments.length
    );
  } catch (error) {
    return responseHandler(res, 500, "Error retrieving payments", error);
  }
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

  const { error } = UserPaymentSchema.validate(data, {
    abortEarly: true,
  });

  const payment_exist = await Payment.findOne({
    category: data.category,
    member: userId,
    status: { $in: ["pending", "accepted", "expiring"] },
  });

  if (payment_exist) {
    return responseHandler(res, 400, "Payment already exist");
  }

  if (error) {
    return responseHandler(res, 400, `Invalid input: ${error.message}`);
  }

  let invoice_url = "";
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
    member: userId,
  });

  try {
    await newPayment.save();
    return responseHandler(
      res,
      201,
      "Payment submitted successfully!",
      newPayment
    );
  } catch (err) {
    return responseHandler(res, 500, `Error saving payment: ${err.message}`);
  }
};

/****************************************************************************************************/
/*                       Function to get users Subscription Active                                  */
/****************************************************************************************************/
exports.getUserSubscriptionActive = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return responseHandler(res, 400, "Invalid request");
  }

  const subscriptionsActive = await Payment.find({
    member: userId,
    status: { $in: ["pending", "accepted", "expiring"] },
  });
  if (!subscriptionsActive) {
    return responseHandler(
      res,
      404,
      "No pending or active subscriptions found"
    );
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
      status: { $in: ["pending", "accepted", "expiring", "expired"] },
    }).sort({ createdAt: -1 });

    // Structure the response
    const structuredResponse = {
      Membership: null,
      App: null,
    };

    if (!subscriptionsActive || subscriptionsActive.length === 0) {
      return responseHandler(
        res,
        200,
        "No pending or active subscriptions found",
        structuredResponse
      );
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
        } else if (
          status === "pending" &&
          membershipSubscriptionStatus !== "accepted" &&
          membershipSubscriptionStatus !== "expiring"
        ) {
          membershipSubscriptionStatus = "pending"; // Set to "pending" if no "accepted" is found
          // Set the lastRenewed and nextRenewal dates for membership
          structuredResponse.Membership = {
            lastRenewed: date,
            nextRenewal: renewal,
            status: membershipSubscriptionStatus, // Set the final status after the loop
          };
        } else if (status === "expired" && !membershipSubscriptionStatus) {
          if (
            !structuredResponse.Membership ||
            new Date(createdAt) >
              new Date(structuredResponse.Membership.lastRenewed)
          ) {
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
        } else if (
          status === "pending" &&
          appSubscriptionStatus !== "accepted" &&
          appSubscriptionStatus !== "expiring"
        ) {
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

exports.createParentSubscription = async (req, res) => {
  try {
    const { error } = createParentSubSchema.validate(req.body, {
      abortEarly: true,
    });
    if (error) {
      return responseHandler(res, 400, `Invalid input: ${error.message}`);
    }
    const payment = await ParentSub.create(req.body);
    if (!payment) {
      return responseHandler(res, 500, "Error saving payment");
    } else {
      return responseHandler(res, 200, "Payment saved successfully", payment);
    }
  } catch (error) {
    return responseHandler(res, 500, "Internal Server Error", error.message);
  }
};

exports.updateParentSubscription = async (req, res) => {
  try {
    const { error } = editParentSubSchema.validate(req.body, {
      abortEarly: true,
    });
    if (error) {
      return responseHandler(res, 400, `Invalid input: ${error.message}`);
    }
    const { id } = req.params;
    const payment = await ParentSub.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!payment) {
      return responseHandler(res, 500, "Error saving payment");
    } else {
      return responseHandler(res, 200, "Payment saved successfully", payment);
    }
  } catch (error) {
    return responseHandler(res, 500, "Internal Server Error", error.message);
  }
};

exports.getParentSubscription = async (req, res) => {
  try {
    const payment = await ParentSub.find();
    if (!payment) {
      return responseHandler(res, 500, "Error saving payment");
    } else {
      return responseHandler(res, 200, "Payment saved successfully", payment);
    }
  } catch (error) {
    return responseHandler(res, 500, "Internal Server Error", error.message);
  }
};
