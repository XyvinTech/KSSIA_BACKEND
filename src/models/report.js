const mongoose = require("mongoose");

const reportSchema = mongoose.Schema(
  {
    content: { type: String },
    reportBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reportTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reportType: {
      type: { String },
      enum: ["product", "requirement", "user","chat"],
    },
  },
  { timestamps: true }
);

const Report = mongoose.model("Report", reportSchema);

module.exports = Report;