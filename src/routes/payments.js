const express = require("express");
const paymentController = require("../controllers/paymentsController");
const authVerify = require("../middlewares/authVerify");
const asyncHandler = require("../utils/asyncHandler");
const upload = require("../middlewares/uploads");

const paymentRoute = express.Router();

// Protect all routes with authentication middleware
paymentRoute.use(authVerify);

// Route to create a new payment
paymentRoute.post('/', asyncHandler(paymentController.createPayment));

// Route to create a new payment (user)
paymentRoute.post('/user', upload.single('file'), asyncHandler(paymentController.createUserPayment));

// Route to get all payments
paymentRoute.get('/', asyncHandler(paymentController.getAllPayments));

// Route to get a specific payment by ID
paymentRoute.get('/:paymentID', asyncHandler(paymentController.getPaymentById));

// Route to update a payment
paymentRoute.put('/:paymentID', asyncHandler(paymentController.updatePayment));

// Route to update a payment
paymentRoute.put('/:paymentID/subscription', asyncHandler(paymentController.updateSubs));

// Route to delete a payment
paymentRoute.delete('/:paymentID', asyncHandler(paymentController.deletePayment));

// Route to update the status of a payment
paymentRoute.patch('/:paymentID/status', asyncHandler(paymentController.updatePaymentStatus));

// Route to get the payments of a user
paymentRoute.get('/user/:userId', asyncHandler(paymentController.getUserPayments));

// Route to get the active subscription of a user
paymentRoute.get('/user/:userId/subscriptions', asyncHandler(paymentController.getUserSubscriptionActive));

// Route to get the active subscription of a user for app purpose
paymentRoute.get('/user/:userId/subscriptions/app', asyncHandler(paymentController.getUserSubscriptionActiveApp));


module.exports = paymentRoute;
