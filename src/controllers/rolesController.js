const CreateRolesSchema = require('../validation/roles/create-role.validation');
const Roles = require('../models/roles');
const responseHandler = require("../helpers/responseHandler");
const mongoose = require('mongoose');
const paginateAndFilter = require('../utils/paginateAndFilter')

exports.createRoles = async (req, res) => {
    try {
        const data = req.body;
        const { error } = CreateRolesSchema.validate(data, {
            abortEarly: true
        });
        if (error) {
            if (error) {
                return responseHandler(res, 400, error.message);
            }
        }
        const rolesData = new Roles(data);
        const response = await rolesData.save();
        return responseHandler(res, 201, "New role created successfully!", response);
    } catch (error) {
        return responseHandler(res, error.status || 500, error.message || 'Internal Server Error');
    }
}

exports.findAllRoles = async (req, res) => {
    const { page = 1, limit = 10, role_name, description } = req.query;
    const filterOptions = { role_name, description };
    try {
        const { documents: roles, pagination } = await paginateAndFilter(Roles, req.query, filterOptions, page, limit);
        return responseHandler(res, 200, 'Roles fetched successfully', { roles, pagination });
    } catch (error) {
        return responseHandler(res, 500, error.message);
    }
};
exports.deleteRole = async (req, res) => {
    const { id } = req.params;
    try {
        const response = await Roles.findByIdAndDelete(new mongoose.Types.ObjectId(id)).lean();
        if (!response) {
            return responseHandler(res, 404, 'Role not found');
        }
        return responseHandler(res, 200, 'Role deleted successfully', response);
    }
    catch (error) {
        return responseHandler(res, error.status || 500, error.message || 'Internal Server Error');
    }
}

exports.findOne = async (req, res) => {
    const { id } = req.params;
    try {
        const response = await Roles.findOne(new mongoose.Types.ObjectId(id)).lean();
        if (!response) {
            return responseHandler(res, 404, 'Role not found');
        }
        return responseHandler(res, 200, 'Role fetched successfully', response);
    }
    catch (error) {
        return responseHandler(res, error.status || 500, error.message || 'Internal Server Error');
    }

}