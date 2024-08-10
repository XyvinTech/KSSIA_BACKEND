const express = require("express");
const rolesController = require("../controllers/rolesController");
// const authVerify = require("../middlewares/authVerify");
const asyncHandler = require("../utils/asyncHandler");
const rolesRoute = express.Router();

rolesRoute
    .route("/")
    .post(asyncHandler(rolesController.createRoles));

rolesRoute
    .route("/")
    .get(asyncHandler(rolesController.findAllRoles));

rolesRoute
    .route("/:id")
    .delete(asyncHandler(rolesController.deleteRole));

rolesRoute
    .route("/:id")
    .get(asyncHandler(rolesController.findOne));

rolesRoute
    .route("/:id")
    .patch(asyncHandler(rolesController.editRole));    

module.exports = rolesRoute;