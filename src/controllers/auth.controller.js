require("dotenv").config();
const Admin = require("../models/admin.model");
const jwt = require("jsonwebtoken");
const responseHandler = require("../helpers/responseHandler");
const { CreateAdminSchema, EditAdminSchema } = require("../validation/index");
const { generateRandomPassword } = require("../utils/generateRandomPassword");
const Role = require("../models/roles");
const sendMail = require("../utils/sendMail");

const JWT_SECRET = process.env.JWT_SECRET;

// Admin login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  // Find the admin by email
  const admin = await Admin.findOne({ email });
  if (!admin) {
    return responseHandler(res, 401, "Invalid email or password");
  }

  // Compare the password
  const isMatch = password === admin.password; // Replace with a proper hash comparison if using hashing
  if (!isMatch) {
    return responseHandler(res, 401, "Invalid email or password");
  }

  // Generate JWT token
  const token = jwt.sign({ id: admin._id, role: admin.role }, JWT_SECRET, {});

  return responseHandler(res, 200, "Login successful", { token });
};

// Admin logout (simply clear the token on the client-side)
exports.logout = async (req, res) => {
  return responseHandler(res, 200, "Logout successful");
};

// Create a new admin
exports.createAdmin = async (req, res) => {
  const data = req.body;

  // Validate the input data
  const { error } = CreateAdminSchema.validate(data);
  if (error) {
    return responseHandler(res, 400, `Invalid input: ${error.message}`);
  }

  // Check if the email is already in use
  const existingAdmin = await Admin.findOne({ email: data.email });
  if (existingAdmin) {
    return responseHandler(res, 400, "Email already in use");
  }

  const designation = await Role.findOne({ _id: data.role });

  const initialPassword = generateRandomPassword();
  req.body.password = initialPassword;

  const subject = ` Welcome mail`;
  const text = `Welcome  ${data.name}.
     Your ${data.email} is designated to ${designation.roleName} and your current password is ${initialPassword}
     You can change your password through site
     Regards,
     KSSIA Team
      `;
  const mailData = {
    to: data.email,
    subject: subject,
    text: text,
  };

  await sendMail(mailData);

  // Create and save the new admin
  const newAdmin = await Admin.create(req.body);

  return responseHandler(res, 201, "Admin created successfully", newAdmin);
};

// Edit an existing admin
exports.editAdmin = async (req, res) => {
  const adminId = req.params.id;
  const data = req.body;

  // Validate the input data
  const { error } = EditAdminSchema.validate(data);
  if (error) {
    return responseHandler(res, 400, `Invalid input: ${error.message}`);
  }

  // Find the admin by ID
  const admin = await Admin.findById(adminId);
  if (!admin) {
    return responseHandler(res, 404, "Admin not found");
  }

  // Update the admin's details
  Object.assign(admin, data);
  await admin.save();

  return responseHandler(res, 200, "Admin updated successfully", admin);
};

// Get all admins
exports.getAllAdmins = async (req, res) => {
  const { pageNo = 1, limit = 10, search = "" } = req.query;
  const skipCount = limit * (pageNo - 1);
  let filter = {
    _id: { $ne: "66f65644bdc60df7dd75d4b7" },
  };

  // Add search functionality
  if (search) {
    const regex = new RegExp(search, "i"); // 'i' for case-insensitive
    filter = {
      $or: [{ name: { $regex: regex } }, { email: { $regex: regex } }],
    };
  }

  const totalCount = await Admin.countDocuments(filter);
  const admins = await Admin.find(filter)
    .skip(skipCount)
    .limit(limit)
    .sort({ createdAt: -1 }) // Customize sorting as needed
    .lean();
  return responseHandler(
    res,
    200,
    "Admins retrieved successfully",
    admins,
    totalCount
  );
};

// Get admin by ID
exports.getAdminById = async (req, res) => {
  const adminId = req.params.id;

  // Find the admin by ID
  const admin = await Admin.findById(adminId);
  if (!admin) {
    return responseHandler(res, 404, "Admin not found");
  }

  return responseHandler(res, 200, "Admin retrieved successfully", admin);
};

// Get admin details
exports.getAdmin = async (req, res) => {
  const adminId = req.adminId;

  // Find the admin by ID
  const admin = await Admin.findById(adminId);
  if (!admin) {
    return responseHandler(res, 404, "Admin not found");
  }

  return responseHandler(res, 200, "Admin retrieved successfully", admin);
};

// Delete admin details
exports.deleteAdmin = async (req, res) => {
  const adminId = req.adminId;
  const delId = req.params.id;

  // Find the admin by ID
  const admin = await Admin.findByIdAndDelete(delId);
  if (!admin) {
    return responseHandler(res, 404, "Admin not found");
  }

  return responseHandler(res, 200, "Admin Delete successfully", admin);
};
