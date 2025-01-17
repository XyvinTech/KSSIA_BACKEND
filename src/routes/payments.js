const express = require("express");
const paymentController = require("../controllers/paymentsController");
const authVerify = require("../middlewares/authVerify");
const asyncHandler = require("../utils/asyncHandler");
const upload = require("../middlewares/uploads");

const paymentRoute = express.Router();

paymentRoute.use(authVerify);

paymentRoute.post("/", asyncHandler(paymentController.createPayment));

paymentRoute
  .route("/parent-subscription")
  .post(paymentController.createParentSubscription)
  .get(paymentController.getParentSubscription);

// Route to update the status of a payment
paymentRoute.patch(
  "/:paymentID/status",
  asyncHandler(paymentController.updatePaymentStatus)
);

paymentRoute.put("/update/:id", asyncHandler(paymentController.updatePayment));

paymentRoute.get(
  "/user/:userId",
  asyncHandler(paymentController.getUserPayments)
);

paymentRoute.get("/", asyncHandler(paymentController.getAllPayments));

// Route to create a new payment (user)
paymentRoute.post("/user", asyncHandler(paymentController.createUserPayment));

// Route to get all payments

// Route to get a specific payment by ID
paymentRoute.get("/:paymentID", asyncHandler(paymentController.getPaymentById));

// Route to update a payment
paymentRoute.put(
  "/:paymentID/subscription",
  asyncHandler(paymentController.updateSubs)
);

// Route to delete a payment
paymentRoute.delete(
  "/:paymentID",
  asyncHandler(paymentController.deletePayment)
);

// Route to get the active subscription of a user
paymentRoute.get(
  "/user/:userId/subscriptions",
  asyncHandler(paymentController.getUserSubscriptionActive)
);

// Route to get the active subscription of a user for app purpose
paymentRoute.get(
  "/user/:userId/subscriptions/app",
  asyncHandler(paymentController.getUserSubscriptionActiveApp)
);

paymentRoute.put(
  "/parent-subscription/:id",
  paymentController.updateParentSubscription
);

module.exports = paymentRoute;
