const checkAccess = require("../helpers/checkAccess");
const responseHandler = require("../helpers/responseHandler");
const Role = require("../models/roles");
const validations = require("../validation");
const moment = require("moment-timezone");

exports.createRole = async (req, res) => {
  try {
    const check = await checkAccess(req.roleId, "permissions");
    if (!check || !check.includes("roleManagement_modify")) {
      return responseHandler(
        res,
        403,
        "You don't have permission to perform this action"
      );
    }
    const createRoleValidator = validations.createRoleSchema.validate(
      req.body,
      {
        abortEarly: true,
      }
    );
    if (createRoleValidator.error) {
      return responseHandler(
        res,
        400,
        `Invalid input: ${createRoleValidator.error}`
      );
    }
    const newRole = await Role.create(req.body);
    if (!newRole) {
      return responseHandler(res, 400, `Role creation failed...!`);
    }
    return responseHandler(
      res,
      201,
      `New Role created successfull..!`,
      newRole
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.editRole = async (req, res) => {
  try {
    const check = await checkAccess(req.roleId, "permissions");
    if (!check || !check.includes("roleManagement_modify")) {
      return responseHandler(
        res,
        403,
        "You don't have permission to perform this action"
      );
    }

    const { id } = req.params;
    if (!id) {
      return responseHandler(res, 400, "Role ID is required");
    }

    const findRole = await Role.findById(id);
    if (!findRole) {
      return responseHandler(res, 404, "Role not found");
    }
    const editRoleValidator = validations.editRoleSchema.validate(req.body, {
      abortEarly: true,
    });
    if (editRoleValidator.error) {
      return responseHandler(
        res,
        400,
        `Invalid input: ${editRoleValidator.error}`
      );
    }
    const updateRole = await Role.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (updateRole) {
      return responseHandler(
        res,
        200,
        `Role updated successfully..!`,
        updateRole
      );
    } else {
      return responseHandler(res, 400, `Role update failed...!`);
    }
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.getRole = async (req, res) => {
  try {
    const check = await checkAccess(req.roleId, "permissions");
    if (!check || !check.includes("roleManagement_view")) {
      return responseHandler(
        res,
        403,
        "You don't have permission to perform this action"
      );
    }

    const { id } = req.params;
    if (!id) {
      return responseHandler(res, 400, "Role ID is required");
    }
    const findRole = await Role.findById(id).lean();
    const mappedData = {
      ...findRole,
      createdAt: moment(findRole.createdAt).format("MMM DD YYYY"),
    };
    if (!findRole) {
      return responseHandler(res, 404, "Role not found");
    }
    return responseHandler(res, 200, "Role found", mappedData);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.deleteRole = async (req, res) => {
  try {
    const check = await checkAccess(req.roleId, "permissions");
    if (!check || !check.includes("roleManagement_modify")) {
      return responseHandler(
        res,
        403,
        "You don't have permission to perform this action"
      );
    }

    const { id } = req.params;
    if (!id) {
      return responseHandler(res, 400, "Role ID is required");
    }

    const findRole = await Role.findById(id);
    if (!findRole) {
      return responseHandler(res, 404, "Role not found");
    }

    const deleteRole = await Role.findByIdAndDelete(id);
    if (deleteRole) {
      return responseHandler(res, 200, `Role deleted successfully..!`);
    } else {
      return responseHandler(res, 400, `Role deletion failed...!`);
    }
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.getAllRoles = async (req, res) => {
  try {
    const { pageNo = 1, status, limit = 10 } = req.query;
    const skipCount = 10 * (pageNo - 1);
    const filter = {};
    const totalCount = await Role.countDocuments(filter);
    const data = await Role.find(filter)
      .skip(skipCount)
      .limit(limit)
      .sort({ createdAt: -1, _id: 1 })
      .lean();

    return responseHandler(
      res,
      200,
      `Roles found successfull..!`,
      data,
      totalCount
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};
