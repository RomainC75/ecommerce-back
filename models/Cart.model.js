const { Schema, SchemaTypes, model } = require("mongoose");

const cartSchema = new Schema({
  userId: {
    type: SchemaTypes.ObjectId,
    ref: "User",
  },
  products: [
    {
      productId: { 
        type: SchemaTypes.ObjectId, 
        ref: "Product"
     },
      quantity:{type: Number, required:true}
    },
  ],
  status: {
    type: SchemaTypes.String,
    enum: ["Pending", "Payed", "Shipped", "Received"],
    default: "Pending"
  },
},{
  timestamps:true
});

const Cart = model("Cart", cartSchema);

module.exports = Cart;
