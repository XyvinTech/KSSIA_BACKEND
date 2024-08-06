const express = require("express");
const eventController = require("../controllers/eventController");
const authVerify = require("../middlewares/authVerify");
const asyncHandler = require("../utils/asyncHandler");
const eventRoute = express.Router();

eventRoute.use(authVerify);


eventRoute.post('/', asyncHandler(eventController.createEvent));
eventRoute.get('/', asyncHandler(eventController.getAllEvents));

eventRoute.get('/:eventId', asyncHandler(eventController.getEventById));
eventRoute.put('/:eventId', asyncHandler(eventController.editEvent));
eventRoute.delete('/:eventId', asyncHandler(eventController.deleteEvent));

module.exports = eventRoute;
