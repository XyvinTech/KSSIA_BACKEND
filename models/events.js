const mongoose = require('mongoose');

const eventSchema = mongoose.Schema(
    {
        type: { type: String },
        name: { type: String },
        image: { type: String },
        date: { type: Date },
        time: { type: Date },
        platform: { type: String },
        meeting_link: { type: String },
        organiser_name: { type: String,  required: true },
        organiser_company_name: { type: String, required: true },
        guest_image: { type: String, required: false },
        organiser_role: {  type: String, required: true },
        speakers: [{ 
            speaker_name: { type: String, required: true },
            speaker_designation: { type: String,  required: true },
            speaker_image: {  type: String, required: false },
            speaker_role: { type: String, required: true }
        }],
        activate: { type: Boolean }
    },
    {
        timestamps: true,
    }
);

const event = mongoose.model("Events", eventSchema);

module.exports = event;