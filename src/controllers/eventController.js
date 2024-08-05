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
    const updatedEvent = await Event.findByIdAndUpdate(eventId, data, { new: true, runValidators: true });

    if (!updatedEvent) {
        return responseHandler(res, 404, "Event not found");
    }

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

        return responseHandler(res, 200, "Event deleted successfully");
};
