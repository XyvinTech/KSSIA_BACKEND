const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        first_name: { type: String, required: true },
        middle_name: { type: String, required: false },
        last_name: { type: String, required: true },
        membership_id: { type: String, required: true },
        blood_group: { type: String },
        email: { type: String, unique: true },
        profile_picture: { type: String },
        phone_numbers: {
            personal: { type: Number, required: true, unique: true },
            landline: { type: Number, unique: true },
            company_phone_number: { type: Number },
            whatsapp_number: { type: Number },
            whatsapp_business_number: { type: Number },
        },
        password: { type: String, required: true },
        otp: { type: Number },
        designation: { type: String },
        company_name: { type: String },
        company_email: { type: String },
        bio: { type: String },
        address: {
            street: String,
            city: String,
            state: String,
            zip: String
        },
        social_media: [
            {
                platform: { type: String },
                url: { type: String }
            }
        ],
        websites: [
            {
                name: { type: String },
                url: { type: String }
            }
        ],
        video: [
            {
                name: { type: String },
                url: { type: String }
            }
        ],
        awards: [
            {
                name: { type: String },
                url: { type: String }
            }
        ],
        certificates: [
            {
                name: { type: String },
                url: { type: String }
            }
        ],
        brochure: [
            {
                name: { type: String },
                url: { type: String }
            }
        ],
        is_active: { type: Boolean, default: true },
        is_deleted: { type: Boolean, default: false },
    },
    {
        timestamps: true,
    }
);

const User = mongoose.model('User', userSchema);

module.exports = User;