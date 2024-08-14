const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    member: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    date: { type: Date, required: true },
    time: { type: Date, required: true },
    amount: { type: Number, required: true },
    mode_of_payment: { type: String, required: true },
    category: { type: String, required: true },
    status: { 
        type: String,
        default: "pending",
        enum: ["pending", "accepted", "resubmit", "rejected"],
     },
    invoice_url: { type: String },
    remarks: { type: String },
    reason: { type: String },
});

const payment = mongoose.model('Payment', paymentSchema);

module.exports = payment;
