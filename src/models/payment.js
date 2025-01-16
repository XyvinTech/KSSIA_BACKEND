const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      default: "active",
      enum: ["active", "expired", "expiring"],
    },
    amount: { type: Number, min: 0 },
    category: {
      type: String,
      enum: ["app", "membership"],
    },
    parentSub: { type: mongoose.Schema.Types.ObjectId, ref: "ParentSub" },
    receipt: { type: String },
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;
