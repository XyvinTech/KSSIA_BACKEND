require("dotenv").config();
const path = require("path");
const handleFileUpload = require("../utils/fileHandler");
const deleteFile = require("../helpers/deleteFiles");
const responseHandler = require("../helpers/responseHandler");
const Event = require("../models/events");
const User = require("../models/user.js");
const { CreateEventsSchema, EditEventsSchema } = require("../validation");
const { getMessaging } = require("firebase-admin/messaging");

/****************************************************************************************************/
/*                                    Function to add event                                       */
/****************************************************************************************************/

// Create a new event
exports.createEvent = async (req, res) => {
  const data = req.body;

  // Validate the input data using Joi
  const { error } = CreateEventsSchema.validate(data, { abortEarly: true });

  // Check if an event with the same details already exists
  const eventExist = await Event.findOne({
    name: data.name,
    organiser_name: data.organiser_name,
    date: data.date,
    time: data.time,
  });
  if (eventExist) return responseHandler(res, 400, "Event already exists");

  if (error)
    return responseHandler(res, 400, `Invalid input: ${error.message}`);

  // Create and save the new event
  const newEvent = new Event(data);

  try {
    await newEvent.save();
    return responseHandler(
      res,
      201,
      "New event created successfully!",
      newEvent
    );
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

  // Validate the input data using Joi
  const { error } = EditEventsSchema.validate(data, { abortEarly: true });
  if (error)
    return responseHandler(res, 400, `Invalid input: ${error.message}`);

  try {
    // Find the existing event
    const event = await Event.findById(eventId);
    if (!event) return responseHandler(res, 404, "Event not found");

    // Save the updated event
    const edited = await Event.findByIdAndUpdate(eventId, data, { new: true });
    if (!edited) {
      return responseHandler(res, 200, "Event updation failed!");
    }
    return responseHandler(res, 200, "Event updated successfully!", edited);
  } catch (err) {
    return responseHandler(res, 500, `Error updating event: ${err.message}`);
  }
};

/****************************************************************************************************/
/*                                  Function to get all events                                     */
/****************************************************************************************************/

// Get all events
exports.getAllEvents = async (req, res) => {
  const { pageNo = 1, limit = 10, search = "" } = req.query;
  const skipCount = limit * (pageNo - 1);

  // Build search filter
  const filter = search
    ? {
        $or: [
          { name: { $regex: search, $options: "i" } }, // case-insensitive search
          { type: { $regex: search, $options: "i" } },
          { organiser_name: { $regex: search, $options: "i" } },
          { organiser_company_name: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          // Search inside speakers array for speaker_name, speaker_designation, or speaker_role
          {
            speakers: {
              $elemMatch: { speaker_name: { $regex: search, $options: "i" } },
            },
          },
          {
            speakers: {
              $elemMatch: {
                speaker_designation: { $regex: search, $options: "i" },
              },
            },
          },
          {
            speakers: {
              $elemMatch: { speaker_role: { $regex: search, $options: "i" } },
            },
          },
        ],
      }
    : {};

  const totalCount = await Event.countDocuments(filter);
  const events = await Event.find(filter)
    .skip(skipCount)
    .limit(limit)
    .sort({ startDate: -1 }) // Customize sorting as needed
    .lean();

  return responseHandler(
    res,
    200,
    "Events retrieved successfully",
    events,
    totalCount
  );
};

/****************************************************************************************************/
/*                                 Function to get event by id                                    */
/****************************************************************************************************/

// Get event by ID
exports.getEventById = async (req, res) => {
  const { eventId } = req.params;
  if (!eventId) return responseHandler(res, 400, "Invalid request");

  const event = await Event.findById(eventId).populate({
    path: "rsvp",
    select: "name company_name phone_numbers",
  });
  if (!event) return responseHandler(res, 404, "Event not found");

  return responseHandler(res, 200, "Event retrieved successfully", event);
};

/****************************************************************************************************/
/*                                    Function to delete event                                      */
/****************************************************************************************************/

// Delete an event
exports.deleteEvent = async (req, res) => {
  const { eventId } = req.params;

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
      await Promise.all(
        event.speakers.map(async (speaker) => {
          if (speaker.speaker_image) {
            let oldImageKey = path.basename(speaker.speaker_image);
            await deleteFile(bucketName, oldImageKey);
          }
        })
      );
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
      return responseHandler(res, 404, "Event not found.");
    }

    await event.markrsvp(userId);

    const user = await User.findById(userId).select("fcm");
    const topic = `event_${event._id}`;
    const fcmToken = user.fcm;

    try {
      await getMessaging().subscribeToTopic(fcmToken, topic);
    } catch (error) {
      console.log(`error: ${error}`);
    }
    return responseHandler(res, 200, "RSVP updated successfully!", event);
  } catch (err) {
    console.log(`Server error: ${err}`);
    return responseHandler(res, 500, `Server error: ${err.message}`);
  }
};

/****************************************************************************************************/
/*                                  Function to get rsvp'd users                                    */
/****************************************************************************************************/
exports.getRsvpUsers = async (req, res) => {
  const { eventId } = req.params;

  if (!eventId) {
    return responseHandler(res, 400, "Invalid request: Event ID is required.");
  }

  try {
    const event = await Event.findById(eventId).populate("rsvp", "name"); // Populate names

    if (!event) {
      return responseHandler(res, 404, "Event not found.");
    }

    const rsvpUsers = event.rsvp; // This will contain user objects with names populated
    return responseHandler(
      res,
      200,
      "RSVP users retrieved successfully!",
      rsvpUsers
    );
  } catch (err) {
    return responseHandler(
      res,
      500,
      `Error retrieving RSVP users: ${err.message}`
    );
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
      return responseHandler(res, 404, "No events found for this user.");
    }

    return responseHandler(
      res,
      200,
      "RSVP'd events retrieved successfully!",
      events,
      totalCount
    );
  } catch (err) {
    return responseHandler(
      res,
      500,
      `Error retrieving RSVP'd events: ${err.message}`
    );
  }
};

/****************************************************************************************************/
/*                                  Function to postpond the events                                 */
/****************************************************************************************************/

exports.postpondEvents = async (req, res) => {
  const { eventId } = req.params;

  req.body.status = "postponded";

  if (!eventId) {
    // If eventId is not provided, return a 400 status code with the error message
    // console.log('Invalid request');                                              // Debug line
    return responseHandler(res, 400, `Invalid request`);
  }

  const event = await Event.findByIdAndUpdate(eventId, req.body, {
    new: true,
  });
  if (!event) {
    return responseHandler(res, 404, "Event not found.");
  }
  return responseHandler(res, 200, "Event updated successfully!", event);
};

/****************************************************************************************************/
/*                                  Function to cancel the events                                 */
/****************************************************************************************************/

exports.cancelEvent = async (req, res) => {
  const { eventId } = req.params;
  if (!eventId) {
    // If eventId is not provided, return a 400 status code with the error message
    // console.log('Invalid request');                                              // Debug line
    return responseHandler(res, 400, `Invalid request`);
  }
  const event = await Event.findById(eventId);
  if (!event) {
    return responseHandler(res, 404, "Event not found.");
  }
  // Check if the event is already cancelled
  if (event.status === "cancelled") {
    return responseHandler(res, 400, "Event is already cancelled.");
  }
  // Update the event status to cancelled
  event.status = "cancelled";
  await event.save();
  return responseHandler(res, 200, "Event cancelled successfully!", event);
};

/****************************************************************************************************/
/*                                Function to get the events history                               */
/****************************************************************************************************/
exports.getEventHistory = async (req, res) => {
  const { pageNo = 1, limit = 10 } = req.query;
  const skipCount = limit * (pageNo - 1);

  const totalCount = await Event.countDocuments({
    status: { $in: ["completed", "cancelled"] },
  });
  const events = await Event.find({
    status: { $in: ["completed", "cancelled"] },
  })
    .skip(skipCount)
    .limit(limit)
    .sort({ startDate: -1 }) // Customize sorting as needed
    .lean();

  if (!events) {
    return responseHandler(res, 404, "No events found.");
  }
  return responseHandler(
    res,
    200,
    "Event retrieved successfully!",
    events,
    totalCount
  );
};

exports.downloadRsvps = async (req, res) => {
  const { id } = req.params;

  const event = await Event.findById(id).populate("rsvp");
  if (!event) {
    return responseHandler(res, 404, "Event not found.");
  }

  const csvData = event?.rsvp?.map((user) => {
    return {
      Name: `${user.name}`.trim(),
      MembershipID: user.membership_id,
      Email: user.email,
      Mobile: user.phone_numbers?.personal || "N/A",
      Company: user.company_name || "N/A",
      Designation: user.designation || "N/A",
    };
  });
  const headers = [
    { header: "Name", key: "Name" },
    { header: "Membership ID", key: "MembershipID" },
    { header: "Email", key: "Email" },
    { header: "Mobile", key: "Mobile" },
    { header: "Company", key: "Company" },
    { header: "Designation", key: "Designation" },
  ];
  return responseHandler(res, 200, "Event RSVP downloaded successfully", {
    headers: headers,
    body: csvData,
  });
};
