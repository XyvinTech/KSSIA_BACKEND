const mongoose = require("mongoose");

const reportSchema = mongoose.Schema(
  {
    content: { type: String },
    reportBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reportTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reportType: {
      type: String,
      enum: ["product", "requirement", "user","chat"],
    },
    reportedItemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      validate: {
        validator: function (v) {
          // Depending on reportType, check if the reportedItemId is valid
          switch (this.reportType) {
            case "product":
              return mongoose.model('Product').exists({ _id: v });
            case "requirement":
              return mongoose.model('Requirements').exists({ _id: v });
            case "user":
              return mongoose.model('User').exists({ _id: v });
            case "chat":
              return mongoose.model('Message').exists({ _id: v });
            default:
              return false;
          }
        },
        message: (props) => `Invalid reported item ID for report type: ${props.value}`,
      },
    },
  },
  { timestamps: true }
);

const Report = mongoose.model("Report", reportSchema);

module.exports = Report;