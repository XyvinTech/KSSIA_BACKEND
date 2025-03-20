const mongoose = require("mongoose");

const roleSchema = mongoose.Schema(
  {
    roleName: { type: String },
    permissions: [{ type: String }],
    description: { type: String },
    status: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Role = mongoose.model("Role", roleSchema);

module.exports = Role;