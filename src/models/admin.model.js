const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Admin schema
const AdminSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role"
    }
},{timestamps: true});

// Middleware to update the updatedAt field before saving
AdminSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Create the Admin model
const Admin = mongoose.model('Admin', AdminSchema);

module.exports = Admin;
