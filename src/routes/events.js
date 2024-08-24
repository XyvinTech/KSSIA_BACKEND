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
  .post(asyncHandler(eventController.createEvent))
  .get(asyncHandler(eventController.getAllEvents));

// Edit an existing event by ID
eventRoute
  .route("/:eventId")
  .get(asyncHandler(eventController.getEventById))
  .put(asyncHandler(eventController.editEvent));

// Delete an event by ID
eventRoute
  .route("/:eventId")
  .delete(asyncHandler(eventController.deleteEvent));

// Route to mark a rsvp 
eventRoute.put(
  '/rsvp/:eventId/mark/:userId', 
  asyncHandler(eventController.addRsvp)
);

// Cancel an event by ID
eventRoute
  .route("/:eventId/cancel")
  .put(asyncHandler(eventController.cancelEvent));

// Cancel an event by ID
eventRoute
  .route("/:eventId/postpond")
  .put(asyncHandler(eventController.postpondEvents));

module.exports = eventRoute;