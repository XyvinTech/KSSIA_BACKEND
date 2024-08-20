const mongoose = require('mongoose');

const requirementsSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    image: { type: String },
    content: { type: String },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    reason: { type: String }
},
{
    timestamps: true,
});

const Requirements = mongoose.model('Requirements', requirementsSchema);

module.exports = Requirements;