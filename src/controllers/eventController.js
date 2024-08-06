const responseHandler = require("../helpers/responseHandler");
const Event = require("../models/events");
const { EditEventsSchema } = require("../validation");
const fs = require('fs');
const path = require('path');

// Helper function to handle file deletion
const deleteFile = (filePath) => {
    fs.unlink(filePath, (err) => {
        if (err) {
            console.error('Error deleting file:', err);
        }
    });
};

// Helper function to generate a new file name with date included
const generateFileName = (originalName) => {
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const fileExtension = path.extname(originalName);
    const baseName = path.basename(originalName, fileExtension);
    return `${baseName}_${date}${fileExtension}`;
};

/****************************************************************************************************/
/*                                    Function to add event                                       */
/****************************************************************************************************/

// Create a new event
exports.createEvent = async (req, res) => {
    const data = req.body;

    // Validate the input data
    const { error } = EditEventsSchema.validate(data, {
        abortEarly: true
    });

    // Check if an error exists in the validation
    if (error) {
        // If an error exists, return a 400 status code with the error message
        // console.log('Invalid input: ${error.message}');                              // Debug line
        return responseHandler(res, 400, `Invalid input: ${error.message}`);
    }

    const eventExist = await Event.findOne({ name: data.name , organiser_name: data.organiser_name, date: data.date, time: data.time });
    if (eventExist) {
        // console.log(`Product already exist`);                                        // Debug line
        return responseHandler(res, 400, "Event already exist");
    }
    // Handle file uploads if present
    if (req.files) {
        if (req.files.image) {
            const newFileName = generateFileName(req.files.image[0].originalname);
            const imagePath = path.join(__dirname, '../uploads/events', newFileName);
            fs.writeFileSync(imagePath, req.files.image[0].buffer);
            data.image = `/uploads/events/${newFileName}`;
        }
        if (req.files.guest_image) {
            const newFileName = generateFileName(req.files.guest_image[0].originalname);
            const guestImagePath = path.join(__dirname, '../uploads/events', newFileName);
            fs.writeFileSync(guestImagePath, req.files.guest_image[0].buffer);
            data.guest_image = `/uploads/events/${newFileName}`;
        }
        if (data.speakers && Array.isArray(data.speakers)) {
            data.speakers = data.speakers.map((speaker, index) => {
                if (req.files[`speaker_image_${index}`]) {
                    const newFileName = generateFileName(req.files[`speaker_image_${index}`][0].originalname);
                    const speakerImagePath = path.join(__dirname, '../uploads/events', newFileName);
                    fs.writeFileSync(speakerImagePath, req.files[`speaker_image_${index}`][0].buffer);
                    speaker.speaker_image = `/uploads/events/${newFileName}`;
                }
                return speaker;
            });
        }
    }

    // Create a new event
    const newEvent = new Event(data);
    await newEvent.save();

    return responseHandler(res, 201, "New event created successfully!", newEvent);

};
/****************************************************************************************************/
/*                                    Function to edit event                                      */
/****************************************************************************************************/

// Edit an existing event
exports.editEvent = async (req, res) => {

    const { eventId } = req.params;
    const data = req.body;

    // Validate the presence of the eventId in the request
    if (!eventId) {
        // console.log(`productId is required`);                                        // Debug line
        return responseHandler(res, 400, "Invalid request");
    }

    // Validate the input data
    const { error } = EditEventsSchema.validate(data, {
        abortEarly: true
    });

    // Check if an error exists in the validation
    if (error) {
        // If an error exists, return a 400 status code with the error message
        // console.log('Invalid input: ${error.message}');                              // Debug line
        return responseHandler(res, 400, `Invalid input: ${error.message}`);
    }
    // Find and update the event
    const event = await Event.findById(eventId);

    if (!event) {
        return responseHandler(res, 404, "Event not found");
    }

    // Handle file uploads if present
    if (req.files) {
        if (req.files.image) {
            if (event.image) {
                deleteFile(path.join(__dirname, '../uploads/events', event.image));
            }
            const newFileName = generateFileName(req.files.image[0].originalname);
            const imagePath = path.join(__dirname, '../uploads/events', newFileName);
            fs.writeFileSync(imagePath, req.files.image[0].buffer);
            data.image = `/uploads/events/${newFileName}`;
        }
        if (req.files.guest_image) {
            if (event.guest_image) {
                deleteFile(path.join(__dirname, '../uploads/events', event.guest_image));
            }
            const newFileName = generateFileName(req.files.guest_image[0].originalname);
            const guestImagePath = path.join(__dirname, '../uploads/events', newFileName);
            fs.writeFileSync(guestImagePath, req.files.guest_image[0].buffer);
            data.guest_image = `/uploads/events/${newFileName}`;
        }
        if (data.speakers && Array.isArray(data.speakers)) {
            data.speakers = data.speakers.map((speaker, index) => {
                if (req.files[`speaker_image_${index}`]) {
                    if (event.speakers[index] && event.speakers[index].speaker_image) {
                        deleteFile(path.join(__dirname, '../uploads/events', event.speakers[index].speaker_image));
                    }
                    const newFileName = generateFileName(req.files[`speaker_image_${index}`][0].originalname);
                    const speakerImagePath = path.join(__dirname, '../uploads/events', newFileName);
                    fs.writeFileSync(speakerImagePath, req.files[`speaker_image_${index}`][0].buffer);
                    speaker.speaker_image = `/uploads/events/${newFileName}`;
                }
                return speaker;
            });
        }
    }

    Object.assign(event, data);
    await event.save();

    return responseHandler(res, 200, "Event updated successfully!", updatedEvent);

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
    const { eventId } = req.params;
    // Check if the productId is present in the request
    if (!eventId) {
        // console.log(`productId is required`);                                        // Debug line
        return responseHandler(res, 400, "Invalid request");
    }
    const event = await Event.findById(eventId);

    if (!event) {
        return responseHandler(res, 404, "Event not found");
    }

    return responseHandler(res, 200, "Event retrieved successfully", event);

};
/****************************************************************************************************/
/*                                    Function to delete product                                       */
/****************************************************************************************************/

// Delete an event
exports.deleteEvent = async (req, res) => {
    const { eventId } = req.params;
    if (!eventId) {
        return responseHandler(res, 400, "Invalid request");
    }
    // Find and delete the event
    const event = await Event.findByIdAndDelete(eventId);
    if (!event) {
        return responseHandler(res, 404, "Event not found");
    }
    // Delete associated files if they exist
    if (event.image) {
        deleteFile(path.join(__dirname, '../uploads/events', event.image));
    }
    if (event.guest_image) {
        deleteFile(path.join(__dirname, '../uploads/events', event.guest_image));
    }
    if (event.speakers && Array.isArray(event.speakers)) {
        event.speakers.forEach(speaker => {
            if (speaker.speaker_image) {
                deleteFile(path.join(__dirname, '../uploads/events', speaker.speaker_image));
            }
        });
    }
    return responseHandler(res, 200, "Event deleted successfully");
};
