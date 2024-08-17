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
    const {
        error
    } = EditEventsSchema.validate(data, {
        abortEarly: true
    });
    if (error) return responseHandler(res, 400, `Invalid input: ${error.message}`);

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
                data.speakers = await Promise.all(data.speakers.map(async (speaker, index) => {
                    if (req.files.speaker_images && req.files.speaker_images[index]) {
                        speaker.speaker_image = await handleFileUpload(req.files.speaker_images[index], bucketName);
                    }
                    return speaker;
                }));
            }
        }
    } catch (err) {
        return responseHandler(res, 500, `Error uploading file: ${err.message}`);
    }

    try {
        // Create and save the new event
        const newEvent = new Event(data);
        await newEvent.save();
    } catch (err) {
        return responseHandler(res, 500, `Error saving event: ${err.message}`);
    }

    return responseHandler(res, 201, "New event created successfully!", newEvent);
};

/****************************************************************************************************/
/*                                    Function to edit event                                      */
/****************************************************************************************************/

// Edit an existing event
exports.editEvent = async (req, res) => {

    const {
        eventId
    } = req.params;
    const data = req.body;

    if (!eventId) return responseHandler(res, 400, "Invalid request");

    // Validate the input data
    const {
        error
    } = EditEventsSchema.validate(data, {
        abortEarly: true
    });
    if (error) return responseHandler(res, 400, `Invalid input: ${error.message}`);

    // Find the event to update
    const event = await Event.findById(eventId);
    if (!event) return responseHandler(res, 404, "Event not found");

    try {
        // Handle file uploads if present
        const bucketName = process.env.AWS_S3_BUCKET;
        if (req.files) {
            // Process main image
            if (req.files.image) {
                if (event.image) {
                    // Delete old image from S3
                    let oldImageKey = path.basename(event.image);
                    await deleteFile(bucketName, oldImageKey);
                }
                data.image = await handleFileUpload(req.files.image[0], bucketName);
            }

            // Process guest image
            if (req.files.guest_image) {
                if (event.guest_image) {
                    // Delete old guest image from S3
                    let oldImageKey = path.basename(event.guest_image);
                    await deleteFile(bucketName, oldImageKey);
                }
                data.guest_image = await handleFileUpload(req.files.guest_image[0], bucketName);
            }

            // Process speaker images
            if (data.speakers && Array.isArray(data.speakers)) {
                data.speakers = await Promise.all(data.speakers.map(async (speaker, index) => {
                    if (req.files[`speaker_image_${index}`]) {
                        if (event.speakers[index] && event.speakers[index].speaker_image) {
                            // Delete old speaker image from S3
                            let oldImageKey = path.basename(event.speakers[index].speaker_image);
                            await deleteFile(bucketName, oldImageKey);
                        }
                        speaker.speaker_image = await handleFileUpload(req.files[`speaker_image_${index}`][0], bucketName);
                    }
                    return speaker;
                }));
            }
        }
    } catch (err) {
        return responseHandler(res, 500, `Error updating file: ${err.message}`);
    }

    try {
        // Update the event with new data
        Object.assign(event, data);
        await event.save();
    } catch (err) {
        return responseHandler(res, 500, `Error saving event: ${err.message}`);
    }

    return responseHandler(res, 200, "Event updated successfully!", event);

};

/****************************************************************************************************/
/*                                  Function to get all events                                     */
/****************************************************************************************************/

// Get all events
exports.getAllEvents = async (req, res) => {

    const events = await Event.find();
    return responseHandler(res, 200, "Events retrieved successfully", events);

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