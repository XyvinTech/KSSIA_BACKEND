const path = require('path');
const handleFileUpload = require("../utils/fileHandler");
const deleteFile = require("../helpers/deleteFiles");
const responseHandler = require("../helpers/responseHandler");
const Event = require("../models/events");
const { EditEventsSchema } = require("../validation");

/****************************************************************************************************/
/*                                    Function to add event                                       */
/****************************************************************************************************/

// Create a new event
exports.createEvent = async (req, res) => {
    try {
        const data = req.body;

        // Validate the input data
        const { error } = EditEventsSchema.validate(data, { abortEarly: true });
        if (error) return responseHandler(res, 400, `Invalid input: ${error.message}`);

        // Check if an event with the same details already exists
        const eventExist = await Event.findOne({ name: data.name, organiser_name: data.organiser_name, date: data.date, time: data.time });
        if (eventExist) return responseHandler(res, 400, "Event already exists");

        // Handle file uploads if present
        const uploadDir = path.join(__dirname, '../uploads/events');
        if (req.files) {
            if (req.files.image) {
                data.image = await handleFileUpload(req.files.image[0], uploadDir);
            }
            if (req.files.guest_image) {
                data.guest_image = await handleFileUpload(req.files.guest_image[0], uploadDir);
            }
            if (data.speakers && Array.isArray(data.speakers)) {
                data.speakers = await Promise.all(data.speakers.map(async (speaker, index) => {
                    if (req.files[`speaker_image_${index}`]) {
                        speaker.speaker_image = await handleFileUpload(req.files[`speaker_image_${index}`][0], uploadDir);
                    }
                    return speaker;
                }));
            }
        }

        // Create and save the new event
        const newEvent = new Event(data);
        await newEvent.save();

        return responseHandler(res, 201, "New event created successfully!", newEvent);
    } catch (err) {
        return responseHandler(res, 500, `Internal server error: ${err.message}`);
    }
};

/****************************************************************************************************/
/*                                    Function to edit event                                      */
/****************************************************************************************************/

// Edit an existing event
exports.editEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        const data = req.body;

        if (!eventId) return responseHandler(res, 400, "Invalid request");

        // Validate the input data
        const { error } = EditEventsSchema.validate(data, { abortEarly: true });
        if (error) return responseHandler(res, 400, `Invalid input: ${error.message}`);

        // Find the event to update
        const event = await Event.findById(eventId);
        if (!event) return responseHandler(res, 404, "Event not found");

        // Handle file uploads if present
        const uploadDir = path.join(__dirname, '../uploads/events');
        if (req.files) {
            if (req.files.image) {
                if (event.image) {
                    deleteFile(path.join(uploadDir, path.basename(event.image)));
                }
                data.image = await handleFileUpload(req.files.image[0], uploadDir);
            }
            if (req.files.guest_image) {
                if (event.guest_image) {
                    deleteFile(path.join(uploadDir, path.basename(event.guest_image)));
                }
                data.guest_image = await handleFileUpload(req.files.guest_image[0], uploadDir);
            }
            if (data.speakers && Array.isArray(data.speakers)) {
                data.speakers = await Promise.all(data.speakers.map(async (speaker, index) => {
                    if (req.files[`speaker_image_${index}`]) {
                        if (event.speakers[index] && event.speakers[index].speaker_image) {
                            deleteFile(path.join(uploadDir, path.basename(event.speakers[index].speaker_image)));
                        }
                        speaker.speaker_image = await handleFileUpload(req.files[`speaker_image_${index}`][0], uploadDir);
                    }
                    return speaker;
                }));
            }
        }

        // Update the event with new data
        Object.assign(event, data);
        await event.save();

        return responseHandler(res, 200, "Event updated successfully!", event);
    } catch (err) {
        return responseHandler(res, 500, `Internal server error: ${err.message}`);
    }
};

/****************************************************************************************************/
/*                                  Function to get all events                                     */
/****************************************************************************************************/

// Get all events
exports.getAllEvents = async (req, res) => {
    try {
        const events = await Event.find();
        return responseHandler(res, 200, "Events retrieved successfully", events);
    } catch (err) {
        return responseHandler(res, 500, `Internal server error: ${err.message}`);
    }
};

/****************************************************************************************************/
/*                                 Function to get event by id                                    */
/****************************************************************************************************/

// Get event by ID
exports.getEventById = async (req, res) => {
    try {
        const { eventId } = req.params;
        if (!eventId) return responseHandler(res, 400, "Invalid request");

        const event = await Event.findById(eventId);
        if (!event) return responseHandler(res, 404, "Event not found");

        return responseHandler(res, 200, "Event retrieved successfully", event);
    } catch (err) {
        return responseHandler(res, 500, `Internal server error: ${err.message}`);
    }
};

/****************************************************************************************************/
/*                                    Function to delete event                                      */
/****************************************************************************************************/

// Delete an event
exports.deleteEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        if (!eventId) return responseHandler(res, 400, "Invalid request");

        // Find and delete the event
        const event = await Event.findByIdAndDelete(eventId);
        if (!event) return responseHandler(res, 404, "Event not found");

        // Delete associated files if they exist
        const uploadDir = path.join(__dirname, '../uploads/events');
        if (event.image) {
            deleteFile(path.join(uploadDir, path.basename(event.image)));
        }
        if (event.guest_image) {
            deleteFile(path.join(uploadDir, path.basename(event.guest_image)));
        }
        if (event.speakers && Array.isArray(event.speakers)) {
            event.speakers.forEach(speaker => {
                if (speaker.speaker_image) {
                    deleteFile(path.join(uploadDir, path.basename(speaker.speaker_image)));
                }
            });
        }

        return responseHandler(res, 200, "Event deleted successfully");
    } catch (err) {
        return responseHandler(res, 500, `Internal server error: ${err.message}`);
    }
};
