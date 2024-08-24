const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    type: {
        type: String
    },
    name: {
        type: String
    },
    image: {
        type: String
    },
    description: {
        type: String
    },
    date: {
        type: Date
    },
    time: {
        type: Date
    },
    platform: {
        type: String
    },
    meeting_link: {
        type: String
    },
    organiser_name: {
        type: String,
        required: true
    },
    organiser_company_name: {
        type: String,
        required: true
    },
    guest_image: {
        type: String,
        required: false
    },
    organiser_role: {
        type: String,
        required: true
    },
    speakers: [{
        speaker_name: {
            type: String,
        },
        speaker_designation: {
            type: String,
        },
        speaker_image: {
            type: String,
        },
        speaker_role: {
            type: String,
        }
    }],
    status: { 
        type: String,
        enum: ['upcoming', 'postponded', 'live', 'cancelled'],
        default: 'upcoming'
    },
    rsvp: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    activate: {
        type: Boolean
    }
}, {
    timestamps: true,
});

eventSchema.methods.markrsvp = function (userId) {
    if (!this.rsvp.includes(userId)) {
        this.rsvp.push(userId);
        return this.save();
    }
    return Promise.resolve(this); // Return the existing document if no change was made.
};

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;