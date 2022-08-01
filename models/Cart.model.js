const { Schema, SchemaTypes, model } = require("mongoose");

const productToOrder = new Schema({
    productId: { 
      type: SchemaTypes.ObjectId, 
      ref: "Product"
   },
    quantity:{type: Number, required:true}
},{_id:false})

const cartSchema = new Schema({
  userId: {
    type: SchemaTypes.ObjectId,
    ref: "User",
  },
  products: [productToOrder]
},{
  timestamps:true
});

const Cart = model("Cart", cartSchema);

module.exports = Cart;
