const mongoose = require('mongoose');

const roleSchema = mongoose.Schema(
    {
        role_name: { type: String },
        permissions:  { type: Map},
        description: { type: String },
    },
    { timestamps: true }
); 
  
const Roles = mongoose.model("Roles", roleSchema);
  
module.exports = Roles;