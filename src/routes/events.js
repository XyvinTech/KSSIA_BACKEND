const express = require("express");
const eventController = require("../controllers/eventController");
const authVerify = require("../middlewares/authVerify");
const asyncHandler = require("../utils/asyncHandler");
const eventRoute = express.Router();
const upload = require("../middlewares/uploads");

eventRoute.use(authVerify);


// Get all events and add a new event
eventRoute
  .route("/events")
  .post(upload.fields([{
      name: 'image',
      maxCount: 1
    },
    {
      name: 'guest_image',
      maxCount: 1
    },
    ...Array.from({
      length: 10
    }, (_, index) => ({
      name: `speaker_image_${index}`,
      maxCount: 1
    }))
  ]), asyncHandler(eventController.createEvent))
  .get(asyncHandler(eventController.getAllEvents));

// Edit an existing event by ID
eventRoute
  .route("/events/:eventId")
  .get(asyncHandler(eventController.getEventById))
  .put(upload.fields([{
      name: 'image',
      maxCount: 1
    },
    {
      name: 'guest_image',
      maxCount: 1
    },
    ...Array.from({
      length: 10
    }, (_, index) => ({
      name: `speaker_image_${index}`,
      maxCount: 1
    }))
  ]), asyncHandler(eventController.editEvent));

// Delete an event by ID
eventRoute
  .route("/events/:eventId")
  .delete(asyncHandler(eventController.deleteEvent));


module.exports = eventRoute;