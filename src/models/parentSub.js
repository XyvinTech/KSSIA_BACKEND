const mongoose = require("mongoose");

const parentSubSchema = new mongoose.Schema(
  {
    academicYear: { type: String },
    month: { type: String },
    date: { type: Date },
  },
  { timestamps: true }
);

const Payment = mongoose.model("parentSub", parentSubSchema);

module.exports = Payment;
