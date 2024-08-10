const mongoose = require('mongoose');
const roleSchema = mongoose.Schema(
    {
        role_name: { type: String, required: true },
        permissions: [
            { 
                name: { type: String, required: true  },
                value: { type: Boolean, required: true  }
            }
        ],
        description: { type: String },
    },
    { timestamps: true }
); 
  
const Roles = mongoose.model("Roles", roleSchema);
  
module.exports = Roles;