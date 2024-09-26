const express = require("express");
const roleController = require("../controllers/roleController");
const authVerify = require("../middlewares/authVerify");
const roleRoute = express.Router();

roleRoute.use(authVerify);

roleRoute.post("/", roleController.createRole);

roleRoute
  .route("/single/:id")
  .get(roleController.getRole)
  .put(roleController.editRole)
  .delete(roleController.deleteRole);

roleRoute.get("/list", roleController.getAllRoles)

module.exports = roleRoute;
