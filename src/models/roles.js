const mongoose = require('mongoose');

const roleSchema = mongoose.Schema(
    {
        role_name: { type: String },
        permissions:  { type: Map},
        description: { type: String },
    },
    { timestamps: true }
);
  
const Role = mongoose.model("Role", roleSchema);
  
module.exports = Role;