const express = require("express");
const eventController = require("../controllers/eventController");
const authVerify = require("../middlewares/authVerify");
const asyncHandler = require("../utils/asyncHandler");
const eventRoute = express.Router();
const upload = require("../middlewares/uploads");

eventRoute.use(authVerify);

// Get all events and add a new event
eventRoute
  .route("/")
  .post(upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'guest_image', maxCount: 1 },
    { name: 'speaker_images', maxCount: 10 }
    ]), asyncHandler(eventController.createEvent))
  .get(asyncHandler(eventController.getAllEvents));

// Edit an existing event by ID
eventRoute
  .route("/:eventId")
  .get(asyncHandler(eventController.getEventById))
  .put(upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'guest_image', maxCount: 1 },
    { name: 'speaker_images', maxCount: 10 }
    ]), asyncHandler(eventController.editEvent));

// Delete an event by ID
eventRoute
  .route("/:eventId")
  .delete(asyncHandler(eventController.deleteEvent));

// Route to mark a rsvp 
eventRoute.put(
  '/rsvp/:eventId/mark', 
  asyncHandler(eventController.addRsvp)
);

// Route to get users rsvp'd to an event
eventRoute.get('/:eventId/rsvp', eventController.getRsvpUsers);

// Route to get events rsvp'd by a user 
eventRoute.get('/user/rsvpd', asyncHandler(eventController.getUserRsvpdEvents));

// Cancel an event by ID
eventRoute
  .route("/:eventId/cancel")
  .put(asyncHandler(eventController.cancelEvent));

// Cancel an event by ID
eventRoute
  .route("/:eventId/postpond")
  .put(asyncHandler(eventController.postpondEvents));

// get all past events
eventRoute
  .route("/history")
  .put(asyncHandler(eventController.getEventHistory));

module.exports = eventRoute;