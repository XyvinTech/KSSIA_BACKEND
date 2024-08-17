const mongoose = require('mongoose');

const Subschema = new mongoose.Schema({
    name: { type: String },
    url: { type: String }
},{ _id: false });

const userSchema = new mongoose.Schema(
    {   name: {
            first_name: { type: String, required: true },
            middle_name: { type: String, required: false },
            last_name: { type: String, required: true }, 
        },
        membership_id: { type: String, required: true, unique: true },
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
        // password: { type: String, required: true },
        otp: { type: Number },
        designation: { type: String },
        company_name: { type: String },
        company_address: { type: String },
        company_logo: { type: String },
        company_email: { type: String },
        business_category: { type: String },
        sub_category: { type: String },
        bio: { type: String },
        address: { type: String },
        social_media: [
            {
                platform: { type: String },
                url: { type: String }
            }
        ],
        websites: [Subschema],
        video: [Subschema],
        awards: [
            {
                url: {type:String},
                name: { type: String },
                authority_name: { type: String }
            }
        ],
        certificates: [Subschema],
        brochure: [Subschema],
        is_active: { type: Boolean, default: true },
        is_deleted: { type: Boolean, default: false },
        selectedTheme: { type: String, default:'white'}
    },
    {
        timestamps: true,
    }
);

const User = mongoose.model('User', userSchema);

module.exports = User;