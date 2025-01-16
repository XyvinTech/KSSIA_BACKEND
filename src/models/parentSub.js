const mongoose = require("mongoose");

const parentSubSchema = new mongoose.Schema(
  {
    academicYear: { type: String },
    expiryDate: { type: Date },
  },
  { timestamps: true }
);

const ParentSub = mongoose.model("parentSub", parentSubSchema);

module.exports = ParentSub;
