const express = require("express");
const eventController = require("../controllers/eventController");
const authVerify = require("../middlewares/authVerify");
const asyncHandler = require("../utils/asyncHandler");
const eventRoute = express.Router();

eventRoute.use(authVerify);

// Create a new event and get all events
eventRoute
  .route("/events")
  .post(asyncHandler(eventController.createEvent))
  .get(asyncHandler(eventController.getAllEvents));

// Edit an existing event, get an event by ID, delete an event
eventRoute
  .route("/events/:eventId")
  .get(asyncHandler(eventController.getEventById))
  .put(asyncHandler(eventController.editEvent))
  .delete(asyncHandler(eventController.deleteEvent));

module.exports = eventRoute;
