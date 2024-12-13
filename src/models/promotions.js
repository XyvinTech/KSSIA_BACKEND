const mongoose = require("mongoose");

// Define the schema for promotions
const promotionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["banner", "video", "poster", "notice"],
    },
    banner_image_url: {
      type: String,
      required: function () {
        return this.type === "banner";
      },
    },
    upload_video: {
      type: String,
      // required: function() { return this.type === 'video';}
    },
    yt_link: {
      type: String,
      required: function () {
        return this.type === "video";
      },
    },
    video_title: {
      type: String,
      required: function () {
        return this.type === "video";
      },
    },
    poster_image_url: {
      type: String,
      required: function () {
        return this.type === "poster";
      },
    },
    notice_title: {
      type: String,
      required: function () {
        return this.type === "notice";
      },
    },
    notice_description: {
      type: String,
      required: function () {
        return this.type === "notice";
      },
    },
    notice_link: {
      type: String,
    },
    status: { type: Boolean, default: false },
    startDate: { type: Date },
    endDate: { type: Date },
  },
  {
    timestamps: true,
  }
);

const Promotion = mongoose.model("Promotion", promotionSchema);

module.exports = Promotion;
