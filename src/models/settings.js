const mongoose = require("mongoose");

const settingSchema = mongoose.Schema(
  {
    application: {
      type: Object,
    },
  },
  { timestamps: true }
);

const Setting = mongoose.model("Setting", settingSchema);

module.exports = Setting;
