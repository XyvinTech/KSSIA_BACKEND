const express = require("express");
const paymentController = require("../controllers/paymentsController");
const authVerify = require("../middlewares/authVerify");
const asyncHandler = require("../utils/asyncHandler");
const upload = require("../middlewares/uploads");

const paymentRoute = express.Router();

// Protect all routes with authentication middleware
paymentRoute.use(authVerify);

// Route to create a new payment
paymentRoute.post('/', upload.single('file'), asyncHandler(paymentController.createPayment));

// Route to update a payment
paymentRoute.put('/:paymentID', upload.single('file'), asyncHandler(paymentController.updatePayment));

// Route to delete a payment
paymentRoute.delete('/:paymentID', asyncHandler(paymentController.deletePayment));

// Route to update the status of a payment
paymentRoute.patch('/:paymentID/status', asyncHandler(paymentController.updatePaymentStatus));

module.exports = paymentRoute;