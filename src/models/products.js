const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        seller_id: { 
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        name: { type: String, required:true },
        image: { type: String },
        price: { type: Number, min: 0, required:true },
        offer_price: { type: Number, min: 0 },
        description: { type: String },
        moq: { type: Number, min: 0 },
        units: { type: Number, min: 0 },
        status: { 
            type: String,
            default: "pending",
            enum: ["pending", "accepted", "rejected", "reported"],
        },
        reason:{ type:String },
        tags: [{ type: String }],
    },
    {
        timestamps: true,
    }
);
  
const Product = mongoose.model("Product", productSchema);
  
module.exports = Product;