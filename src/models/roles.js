const mongoose = require('mongoose');

const roleSchema = mongoose.Schema(
    {
        role_name: { type: String ,unique: true,required: true},
        permissions:  { type: Map},
        description: { type: String },
        isActive: { type: Boolean}
    },
    { timestamps: true }
); 
  
const Roles = mongoose.model("Roles", roleSchema);
  
module.exports = Roles;