const mongoose = require('mongoose');

const approvalSchema = new mongoose.Schema(
    {
        product_id: { 
            type: mongoose.Schema.Types.ObjectId,
            ref: "Products",
            required: true
        },
       
        status: {
            type: String,
            enum: {
              values: ['pending', 'active', 'rejected'],
              message: '{VALUE} is not supported' // Custom error message for invalid value
            },
            default: 'pending'
          },
        tags: [{ type: String }],
    },
    {
        timestamps: true,
    }
);
  
const product = mongoose.model("product-approval", approvalSchema);
  
module.exports = product;