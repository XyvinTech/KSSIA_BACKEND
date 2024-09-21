require("dotenv").config();
const path = require('path');
const handleFileUpload = require("../utils/fileHandler");
const deleteFile = require("../helpers/deleteFiles");
const responseHandler = require("../helpers/responseHandler");
const Event = require("../models/events");
const {
    EditEventsSchema
} = require("../validation");

/****************************************************************************************************/
/*                                    Function to add event                                       */
/****************************************************************************************************/

// Create a new event
exports.createEvent = async (req, res) => {
    const data = req.body;

    // Parse the speakers field, which is coming as a JSON string in form-data
    if (typeof req.body.speakers === 'string') {
        try {
            req.body.speakers = JSON.parse(req.body.speakers);
        } catch (err) {
            return responseHandler(res, 400, 'Invalid input: "speakers" must be a valid JSON array');
        }
    }

    // Validate the input data using Joi
    const { error } = EditEventsSchema.validate(data, { abortEarly: true });

    // Check if an event with the same details already exists
    const eventExist = await Event.findOne({
        name: data.name,
        organiser_name: data.organiser_name,
        date: data.date,
        time: data.time
    });
    if (eventExist) return responseHandler(res, 400, "Event already exists");

    try {
        // Handle file uploads if present
        const bucketName = process.env.AWS_S3_BUCKET;
        if (req.files) {
            if (req.files.image) {
                data.image = await handleFileUpload(req.files.image[0], bucketName);
            }
            if (req.files.guest_image) {
                data.guest_image = await handleFileUpload(req.files.guest_image[0], bucketName);
            }

            // Handle speaker images and assign them to the appropriate speaker
            if (data.speakers && Array.isArray(data.speakers)) {
                const speakerImages = req.files.speaker_images || [];
                data.speakers = await Promise.all(data.speakers.map(async (speaker, index) => {
                    if (speakerImages[index]) {
                        speaker.speaker_image = await handleFileUpload(speakerImages[index], bucketName);
                    }
                    return speaker;
                }));
            }
        }
    } catch (err) {
        return responseHandler(res, 500, `Error uploading file: ${err.message}`);
    }

    if (error) return responseHandler(res, 400, `Invalid input: ${error.message}`);

    // Create and save the new event
    const newEvent = new Event(data);

    try {
        await newEvent.save();
        return responseHandler(res, 201, "New event created successfully!", newEvent);
    } catch (err) {
        return responseHandler(res, 500, `Error saving event: ${err.message}`);
    }
};

/****************************************************************************************************/
/*                                    Function to edit event                                      */
/****************************************************************************************************/

// Edit an existing event
exports.editEvent = async (req, res) => {
    const { eventId } = req.params;
    const data = req.body;

    if (!eventId) return responseHandler(res, 400, "Invalid request");

    // Validate the input data
    const { error } = EditEventsSchema.validate(data, { abortEarly: true });
    // if (error) return responseHandler(res, 400, `Invalid input: ${error.message}`);

    // Parse the speakers field, which is coming as a JSON string in form-data
    if (typeof req.body.speakers === 'string') {
        try {
            req.body.speakers = JSON.parse(req.body.speakers);
        } catch (err) {
            return responseHandler(res, 400, 'Invalid input: "speakers" must be a valid JSON array');
        }
    }
    // Find the event to update
    let event;
    try {
        event = await Event.findById(eventId);
        if (!event) return responseHandler(res, 404, "Event not found");
    } catch (err) {
        return responseHandler(res, 500, `Error finding event: ${err.message}`);
    }

    try {
        // Handle file uploads if present
        const bucketName = process.env.AWS_S3_BUCKET;
        if (req.files) {
            // Process main image
            if (req.files.image) {
                if (event.image) {
                    // Delete old image from S3
                    const oldImageKey = path.basename(event.image);
                    await deleteFile(bucketName, oldImageKey);
                }
                data.image = await handleFileUpload(req.files.image[0], bucketName);
            }

            // Process guest image
            if (req.files.guest_image) {
                if (event.guest_image) {
                    // Delete old guest image from S3
                    const oldImageKey = path.basename(event.guest_image);
                    await deleteFile(bucketName, oldImageKey);
                }
                data.guest_image = await handleFileUpload(req.files.guest_image[0], bucketName);
            }

            // Handle speaker images and assign them to the appropriate speaker by ID
            if (data.speakers && Array.isArray(data.speakers)) {
                const speakerImages = req.files.speaker_images || [];
                data.speakers = await Promise.all(data.speakers.map(async (speaker, index) => {
                    const speakerToUpdate = event.speakers.find(s => s._id.toString() === speaker._id);
                    if (speakerToUpdate) {
                        if (speakerImages[index]) {
                            if (speakerToUpdate.speaker_image) {
                                // Delete the old speaker image from S3
                                const oldImageKey = path.basename(speakerToUpdate.speaker_image);
                                await deleteFile(bucketName, oldImageKey);
                            }
                            // Upload the new speaker image to S3
                            speaker.speaker_image = await handleFileUpload(speakerImages[index], bucketName);
                        }
                    }
                    return speaker;
                }));
            }
        }
    } catch (err) {
        return responseHandler(res, 500, `Error updating file: ${err.message}`);
    }

    try {
        // Update the event with new data (only overwrite fields provided in request)
        Object.assign(event, data);
        
        // Optionally use optimistic concurrency control
        const updatedEvent = await Event.findByIdAndUpdate(eventId, data, {
            new: true,
            runValidators: true
        });

        if (!updatedEvent) {
            return responseHandler(res, 404, "Event not found or already updated");
        }

        return responseHandler(res, 200, "Event updated successfully!", updatedEvent);
    } catch (err) {
        return responseHandler(res, 500, `Error saving event: ${err.message}`);
    }
};

/****************************************************************************************************/
/*                                  Function to get all events                                     */
/****************************************************************************************************/

// Get all events
exports.getAllEvents = async (req, res) => {

    const { pageNo = 1, limit = 10 } = req.query;
    const skipCount = limit * (pageNo - 1);
    const filter = {};

    const totalCount = await Event.countDocuments(filter);
    const events = await Event.find(filter)
    .skip(skipCount)
    .limit(limit)
    .sort({ startDate: -1 }) // Customize sorting as needed
    .lean();

    return responseHandler(res, 200, "Events retrieved successfully", events, totalCount);

};

/****************************************************************************************************/
/*                                 Function to get event by id                                    */
/****************************************************************************************************/

// Get event by ID
exports.getEventById = async (req, res) => {

    const {
        eventId
    } = req.params;
    if (!eventId) return responseHandler(res, 400, "Invalid request");

    const event = await Event.findById(eventId);
    if (!event) return responseHandler(res, 404, "Event not found");

    return responseHandler(res, 200, "Event retrieved successfully", event);
};

/****************************************************************************************************/
/*                                    Function to delete event                                      */
/****************************************************************************************************/

// Delete an event
exports.deleteEvent = async (req, res) => {

    const {
        eventId
    } = req.params;

    if (!eventId) return responseHandler(res, 400, "Invalid request");

    // Find and delete the event
    const event = await Event.findById(eventId);

    if (!event) return responseHandler(res, 404, "Event not found");

    try {
        // Delete associated files if they exist
        const bucketName = process.env.AWS_S3_BUCKET;
        if (event.image) {
            let oldImageKey = path.basename(event.image);
            await deleteFile(bucketName, oldImageKey);
        }
        if (event.guest_image) {
            let oldImageKey = path.basename(event.guest_image);
            await deleteFile(bucketName, oldImageKey);
        }
        if (event.speakers && Array.isArray(event.speakers)) {
            await Promise.all(event.speakers.map(async (speaker) => {
                if (speaker.speaker_image) {
                    let oldImageKey = path.basename(speaker.speaker_image);
                    await deleteFile(bucketName, oldImageKey);
                }
            }));
        }
    } catch (err) {
        return responseHandler(res, 500, `Error deleting file: ${err.message}`);
    }

    try {
        await Event.findByIdAndDelete(eventId);
    } catch (err) {
        return responseHandler(res, 500, `Error deleting event: ${err.message}`);
    }

    return responseHandler(res, 200, "Event deleted successfully");

};

/****************************************************************************************************/
/*                                  Function to mark as rsvp of user                                */
/****************************************************************************************************/

exports.addRsvp = async (req, res) => {

    const eventId = req.params.eventId;
    const userId = req.userId;

    if (!eventId) {
        // If eventId is not provided, return a 400 status code with the error message
        // console.log('Invalid request');                                              // Debug line
        return responseHandler(res, 400, `Invalid request`);
    }
    if (!userId) {
        // If userId is not provided, return a 400 status code with the error message
        // console.log('Invalid request');                                              // Debug line
        return responseHandler(res, 400, `Invalid request`);
    }

    try {
        const event = await Event.findById(eventId);
        if (!event) {
            return responseHandler(res, 404, 'Event not found.');
        }

        await event.markrsvp(userId);
        return responseHandler(res, 200, 'RSVP updated successfully!', event);
    } catch (err) {
        return responseHandler(res, 500, `Server error: ${err.message}`);
    }
};

/****************************************************************************************************/
/*                                  Function to get rsvp'd users                                    */
/****************************************************************************************************/
exports.getRsvpUsers = async (req, res) => {
    const { eventId } = req.params;

    if (!eventId) {
        return responseHandler(res, 400, 'Invalid request: Event ID is required.');
    }

    try {
        const event = await Event.findById(eventId).populate('rsvp', 'name'); // Populate names

        if (!event) {
            return responseHandler(res, 404, 'Event not found.');
        }

        const rsvpUsers = event.rsvp; // This will contain user objects with names populated
        return responseHandler(res, 200, 'RSVP users retrieved successfully!', rsvpUsers);
    } catch (err) {
        return responseHandler(res, 500, `Error retrieving RSVP users: ${err.message}`);
    }
};

/****************************************************************************************************/
/*                                  Function to get events users rsvp'd to                          */
/****************************************************************************************************/
exports.getUserRsvpdEvents = async (req, res) => {
    const userId = req.userId; // Assuming the user ID is available in the request after authentication
    const { pageNo = 1, limit = 10 } = req.query;
    const skipCount = limit * (pageNo - 1);

    try {
        const totalCount = await Event.countDocuments({ rsvp: userId });
        // Find all events where the user ID is included in the rsvp array
        const events = await Event.find({ rsvp: userId })
        .skip(skipCount)
        .limit(limit)
        .sort({ startDate: -1 }) // Customize sorting as needed
        .lean();

        if (!events.length) {
            return responseHandler(res, 404, 'No events found for this user.');
        }

        return responseHandler(res, 200, 'RSVP\'d events retrieved successfully!', events, totalCount);
    } catch (err) {
        return responseHandler(res, 500, `Error retrieving RSVP'd events: ${err.message}`);
    }
};

/****************************************************************************************************/
/*                                  Function to postpond the events                                 */
/****************************************************************************************************/

exports.postpondEvents = async (req, res) => {
    const {
        eventId
    } = req.params;

    req.body.status = "postponded";

    if (!eventId) {
        // If eventId is not provided, return a 400 status code with the error message
        // console.log('Invalid request');                                              // Debug line
        return responseHandler(res, 400, `Invalid request`);
    }

    const event = await Event.findByIdAndUpdate(eventId, req.body, {
        new: true
    });
    if (!event) {
        return responseHandler(res, 404, 'Event not found.');
    }
    return responseHandler(res, 200, 'Event updated successfully!', event);
}

/****************************************************************************************************/
/*                                  Function to cancel the events                                 */
/****************************************************************************************************/

exports.cancelEvent = async (req, res) => {
    const {
        eventId
    } = req.params;
    if (!eventId) {
        // If eventId is not provided, return a 400 status code with the error message
        // console.log('Invalid request');                                              // Debug line
        return responseHandler(res, 400, `Invalid request`);
    }
    const event = await Event.findById(eventId);
    if (!event) {
        return responseHandler(res, 404, 'Event not found.');
    }
    // Check if the event is already cancelled
    if (event.status === 'cancelled') {
        return responseHandler(res, 400, 'Event is already cancelled.');
    }
    // Update the event status to cancelled
    event.status = 'cancelled';
    await event.save();
    return responseHandler(res, 200, 'Event cancelled successfully!', event);
}

/****************************************************************************************************/
/*                                Function to get the events history                               */
/****************************************************************************************************/
exports.getEventHistory = async (req, res) => {

    const { pageNo = 1, limit = 10 } = req.query;
    const skipCount = limit * (pageNo - 1);

    const totalCount = await Event.countDocuments({ status: { $in: ['completed', 'cancelled'] } });
    const events = await Event.find({ status: { $in: ['completed', 'cancelled'] } })
    .skip(skipCount)
    .limit(limit)
    .sort({ startDate: -1 }) // Customize sorting as needed
    .lean();

    if (!events) {
        return responseHandler(res, 404, 'No events found.');
    }
    return responseHandler(res, 200, 'Event retrieved successfully!', events, totalCount);
}