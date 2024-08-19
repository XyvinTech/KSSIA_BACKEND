/**
 * @swagger
 * tags:
 *   name: Events
 *   description: API endpoints for managing events
 */

/**
 * @swagger
 * /events:
 *   post:
 *     summary: Create a new event
 *     tags: 
 *       - Events
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       description: Event object that needs to be added to the system. Includes file uploads for images. 
 *                    The `speakers` field must be sent as a JSON string.
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *               date:
 *                 type: string
 *                 format: date-time
 *               time:
 *                 type: string
 *                 format: date-time
 *               platform:
 *                 type: string
 *               meeting_link:
 *                 type: string
 *               organiser_name:
 *                 type: string
 *               organiser_company_name:
 *                 type: string
 *               guest_image:
 *                 type: string
 *                 format: binary
 *               organiser_role:
 *                 type: string
 *               speakers:
 *                 type: string
 *                 description: "JSON array of speakers, sent as a string."
 *               speaker_images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               activate:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Event created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /events:
 *   get:
 *     summary: Retrieve all events
 *     tags: 
 *       - Events
 *     security:
 *       - BearerAuth: []
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

/**
 * @swagger
 * /events/{eventId}:
 *   get:
 *     summary: Retrieve a single event by ID
 *     tags: 
 *       - Events
 *     security:
 *       - BearerAuth: []
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
 *       404:
 *         description: Event not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /events/{eventId}:
 *   put:
 *     summary: Update an existing event by ID
 *     tags: 
 *       - Events
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the event to update
 *     requestBody:
 *       description: Event object that needs to be updated. Includes file uploads for images.
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *               date:
 *                 type: string
 *                 format: date-time
 *               time:
 *                 type: string
 *                 format: date-time
 *               platform:
 *                 type: string
 *               meeting_link:
 *                 type: string
 *               organiser_name:
 *                 type: string
 *               organiser_company_name:
 *                 type: string
 *               guest_image:
 *                 type: string
 *                 format: binary
 *               organiser_role:
 *                 type: string
 *               speakers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     speaker_name:
 *                       type: string
 *                     speaker_designation:
 *                       type: string
 *                     speaker_image:
 *                       type: string
 *                       format: binary
 *                     speaker_role:
 *                       type: string
 *               activate:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Event updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Event not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /events/{eventId}:
 *   delete:
 *     summary: Delete an event by ID
 *     tags: 
 *       - Events
 *     security:
 *       - BearerAuth: []
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
 *       404:
 *         description: Event not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /events/rsvp/:eventId/mark/:userId:
 *   put:
 *     summary: Mark an rsvp to an event
 *     tags:
 *       - Events
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: The ID of the event to add rsvp to
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: The ID of the user marking the rsvp
 *     responses:
 *       200:
 *         description: RSVP marked successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       400:
 *         description: Invalid request
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Event:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The unique identifier for the event
 *         type:
 *           type: string
 *         name:
 *           type: string
 *         image:
 *           type: string
 *           description: URL of the event image
 *         description:
 *           type: string
 *           description: description of the event
 *         date:
 *           type: string
 *           format: date-time
 *         time:
 *           type: string
 *           format: date-time
 *         platform:
 *           type: string
 *         meeting_link:
 *           type: string
 *         organiser_name:
 *           type: string
 *         organiser_company_name:
 *           type: string
 *         guest_image:
 *           type: string
 *           description: URL of the guest image
 *         organiser_role:
 *           type: string
 *         speakers:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               speaker_name:
 *                 type: string
 *               speaker_designation:
 *                 type: string
 *               speaker_image:
 *                 type: string
 *                 description: URL of the speaker image
 *               speaker_role:
 *                 type: string
 *         activate:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the event was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the event was last updated
 */
