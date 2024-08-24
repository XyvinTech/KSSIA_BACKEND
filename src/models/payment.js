const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    member: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    date: { type: Date },
    time: { type: Date },
    amount: { type: Number },
    mode_of_payment: { type: String },
    invoice_id: { type: String },
    category: { 
        type: String,
        enum: ["app","membership"]
    },
    status: { 
        type: String,
        default: "pending",
        enum: ["pending", "accepted", "resubmit", "rejected"],
    },
    renewal: { type: Date },
    days: { type: Number , default: 365},
    invoice_url: { type: String },
    remarks: { type: String },
    reason: { type: String },
});

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
