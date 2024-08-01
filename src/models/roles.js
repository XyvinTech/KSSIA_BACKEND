const roleSchema = mongoose.Schema(
    {
        role_name: { type: String ,unique: true,required: true},
        permissions: [{ type: String }],
        description: { type: String },
        isActive: { type: Boolean}
    },
    { timestamps: true }
);
  
const Role = mongoose.model("Role", roleSchema);
  
module.exports = Role;