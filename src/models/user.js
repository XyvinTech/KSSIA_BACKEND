const mongoose = require('mongoose');

const Subschema = new mongoose.Schema({
    name: { type: String },
    url: { type: String }
},{ _id: false });

const reviewSchema = new mongoose.Schema({
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    content: { type: String },
    rating: { type: Number, min: 1, max: 5 },
    created_at: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema(
    {   name: {
            first_name: { type: String },
            middle_name: { type: String },
            last_name: { type: String }, 
        },
        membership_id: { type: String, unique: true },
        blood_group: { type: String },
        email: { type: String, unique: true },
        profile_picture: { type: String },
        phone_numbers: {
            personal: { type: String, unique: true },
            landline: { type: String, unique: true },
            company_phone_number: { type: String },
            whatsapp_number: { type: String },
            whatsapp_business_number: { type: String },
        },
        // password: { type: String, },
        otp: { type: Number },
        uid: { type: String },
        fcm: { type: String },
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
        status: {
            type: String,
            enum: ['active', 'inactive', 'suspended', 'notice']
        },
        is_active: { type: Boolean, default: true },
        is_deleted: { type: Boolean, default: false },
        selectedTheme: { type: String, default:'white'},
        reviews: [reviewSchema],
        blocked_users: [{
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            reason: { type: String, required: true } // Reason for blocking
        }],
        blocked_products:[{
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            reason: { type: String, required: true } // Reason for blocking
        }],
        blocked_requirements: [{
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            reason: { type: String, required: true } // Reason for blocking
        }]
    },
    {
        timestamps: true,
    }
);

/// Add a review static method
userSchema.statics.addReview = function (userId, reviewData) {
    return this.findByIdAndUpdate(
        userId,
        { $push: { reviews: reviewData } },
        { new: true, runValidators: true } // Return the updated document, and run validators
    );
};

/// Remove a review instance method
userSchema.methods.deleteReview = function (reviewerId) {
    this.reviews = this.reviews.filter(review => review.reviewer.toString() !== reviewerId.toString());
    return this.save(); // Save the updated document
};

// Block a user instance method
userSchema.methods.blockUser = function (userId, reason) {
    // Check if the user is already blocked
    const isBlocked = this.blocked_users.some(blockedUser => blockedUser.userId.toString() === userId.toString());

    if (!isBlocked) {
        // Push the userId and reason for blocking into the blocked array
        this.blocked_users.push({ userId, reason });
        return this.save();
    }
    return Promise.resolve(this); // No change if the user is already blocked
};

// Unblock a user instance method
userSchema.methods.unblockUser = function (userId) {
    this.blocked_users = this.blocked_users.filter(blockedUser => blockedUser.userId.toString() !== userId.toString());
    return this.save();
};

// Block a product instance method
userSchema.methods.blockProduct = function (productId, reason) {
    const isBlocked = this.blocked_products.some(blockedProduct => blockedProduct.productId.toString() === productId.toString());

    if (!isBlocked) {
        this.blocked_products.push({ productId, reason });
        return this.save();
    }
    return Promise.resolve(this);
};

// Unblock a product instance method
userSchema.methods.unblockProduct = function (productId) {
    this.blocked_products = this.blocked_products.filter(blockedProduct => blockedProduct.productId.toString() !== productId.toString());
    return this.save();
};

// Block a requirement instance method
userSchema.methods.blockRequirement = function (requirementId, reason) {
    const isBlocked = this.blocked_requirements.some(blockedRequirement => blockedRequirement.requirementId.toString() === requirementId.toString());

    if (!isBlocked) {
        this.blocked_requirements.push({ requirementId, reason });
        return this.save();
    }
    return Promise.resolve(this);
};

// Unblock a requirement instance method
userSchema.methods.unblockRequirement = function (requirementId) {
    this.blocked_requirements = this.blocked_requirements.filter(blockedRequirement => blockedRequirement.requirementId.toString() !== requirementId.toString());
    return this.save();
};

const User = mongoose.model('User', userSchema);

module.exports = User;