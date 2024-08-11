require("dotenv").config();
const path = require('path');
const responseHandler = require("../helpers/responseHandler");
const deleteFile = require("../helpers/deleteFiles");
const Payment = require("../models/payment");
const { PaymentSchema } = require("../validation");
const handleFileUpload = require("../utils/fileHandler");

/****************************************************************************************************/
/*                                  Function to create payments                                     */
/****************************************************************************************************/
exports.createPayment = async (req, res) => {
    const data = req.body;

    const { error } = PaymentSchema.validate(data, { abortEarly: true });
    if (error) {
        return responseHandler(res, 400, `Invalid input: ${error.message}`);
    }

    const paymentExist = await Payment.findOne({ member: data.member, date: data.date, time: data.time, category: data.category});
    if (paymentExist) {
        return responseHandler(res, 400, "Payment details already exist");
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

    const newPayment = new Payment({ ...data, invoice_url });

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
    const { paymentID } = req.params;
    const data = req.body;

    const { error } = PaymentSchema.validate(data, { abortEarly: false });
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

    Object.assign(payment, data, { invoice_url });

    try {
        await payment.save();
        return responseHandler(res, 200, "Payment updated successfully!", payment);
    } catch (err) {
        return responseHandler(res, 500, `Error saving payment: ${err.message}`);
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
    const { status, reason } = req.body;

    const validStatuses = ["pending", "accepted", "resubmit", "rejected"];
    if (!validStatuses.includes(status)) {
        return responseHandler(res, 400, "Invalid status value");
    }

    const payment = await Payment.findById(paymentID);
    if (!payment) {
        return responseHandler(res, 404, "Payment details do not exist");
    }

    payment.status = status;
    payment.reason = reason;

    try {
        await payment.save();
        return responseHandler(res, 200, "Payment status updated successfully", payment);
    } catch (err) {
        return responseHandler(res, 500, `Error saving payment: ${err.message}`);
    }
};
