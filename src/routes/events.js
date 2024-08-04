const express = require("express");
const eventController = require("../controllers/eventController");
const authVerify = require("../middlewares/authVerify");
const asyncHandler = require("../utils/asyncHandler");
const eventRoute = express.Router();

eventRoute.use(authVerify);

/**
 * @swagger
 * /events:
 *   post:
 *     summary: Create a new event
 *     tags:
 *       - Events
 *     requestBody:
 *       description: Event object that needs to be created
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Event'
 *     responses:
 *       201:
 *         description: Event created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       400:
 *         description: Invalid input or event already exists
 *       500:
 *         description: Internal server error
 */
eventRoute.post('/', asyncHandler(eventController.createEvent));

/**
 * @swagger
 * /events:
 *   get:
 *     summary: Retrieve all events
 *     tags:
 *       - Events
 *     responses:
 *       200:
 *         description: Events retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Event'
 *       500:
 *         description: Internal server error
 */
eventRoute.get('/', asyncHandler(eventController.getAllEvents));

/**
 * @swagger
 * /events/{eventId}:
 *   get:
 *     summary: Retrieve an event by ID
 *     tags:
 *       - Events
 *     parameters:
 *       - in: path
 *         name: eventId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the event to retrieve
 *     responses:
 *       200:
 *         description: Event retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       400:
 *         description: Invalid request
 *       404:
 *         description: Event not found
 *       500:
 *         description: Internal server error
 */
eventRoute.get('/:eventId', asyncHandler(eventController.getEventById));

/**
 * @swagger
 * /events/{eventId}:
 *   put:
 *     summary: Update an event by ID
 *     tags:
 *       - Events
 *     parameters:
 *       - in: path
 *         name: eventId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the event to update
 *     requestBody:
 *       description: Event object that needs to be updated
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Event'
 *     responses:
 *       200:
 *         description: Event updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       400:
 *         description: Invalid input or event not found
 *       404:
 *         description: Event not found
 *       500:
 *         description: Internal server error
 */
eventRoute.put('/:eventId', asyncHandler(eventController.editEvent));

/**
 * @swagger
 * /events/{eventId}:
 *   delete:
 *     summary: Delete an event by ID
 *     tags:
 *       - Events
 *     parameters:
 *       - in: path
 *         name: eventId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the event to delete
 *     responses:
 *       200:
 *         description: Event deleted successfully
 *       400:
 *         description: Invalid request
 *       404:
 *         description: Event not found
 *       500:
 *         description: Internal server error
 */
eventRoute.delete('/:eventId', asyncHandler(eventController.deleteEvent));

module.exports = eventRoute;