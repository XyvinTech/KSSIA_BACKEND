const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      default: "pending",
      enum: ["active", "expired", "expiring", "pending", "cancelled"],
    },
    amount: { type: Number, min: 0 },
    category: {
      type: String,
      enum: ["app", "membership"],
    },
    parentSub: { type: mongoose.Schema.Types.ObjectId, ref: "parentSub" },
    receipt: { type: String },
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;
