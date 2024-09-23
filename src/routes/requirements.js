const express = require("express");
const requirementsController = require("../controllers/requirementsController");
const authVerify = require("../middlewares/authVerify");
const asyncHandler = require("../utils/asyncHandler");
const upload = require("../middlewares/uploads");

const requirementsRoute = express.Router();

// Protect all routes with authentication middleware
requirementsRoute.use(authVerify);

// Route to create a new requirement
requirementsRoute.post('/', upload.single('file'), asyncHandler(requirementsController.createRequirement));

// Route to get all requirements
requirementsRoute.get('/', asyncHandler(requirementsController.getAllRequirementsUser));

// Route to get all requirements admin
requirementsRoute.get('/admin', asyncHandler(requirementsController.getAllRequirements));

// Route to update a requirement
requirementsRoute.put('/:requirementID', upload.single('file'), asyncHandler(requirementsController.updateRequirement));

// Route to delete a requirement
requirementsRoute.delete('/:requirementID', asyncHandler(requirementsController.deleteRequirement));

// Route to update the status of a requirement
requirementsRoute.patch('/:requirementID/status', asyncHandler(requirementsController.updateRequirementStatus));

// Route to get the requirements of a user
requirementsRoute.get('/:userId', asyncHandler(requirementsController.getUserRequirements));

requirementsRoute.get('/single/:id', asyncHandler(requirementsController.getRequirements));


module.exports = requirementsRoute;
