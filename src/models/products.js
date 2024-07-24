const { Mongoose } = require("mongoose");

const productSchema = mongoose.Schema(
    {
        seller_id: { 
            type: mongoose.Schema.Types.ObjectId,
            ref: "User" 
        },
        name: { type: String },
        image: { type: String },
        price: { type: Number },
        offer_price: { type: Number },
        description: { type: String },
        date : { type: Date },
        units: { type: Number },
        status: { type: Boolean },
        tags: [{ type: String }],
    },
    {
        timestamps: true,
    }
);
  
const product = mongoose.model("Product", productSchema);
  
module.exports = product;