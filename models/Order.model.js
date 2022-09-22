const { Schema, model, SchemaTypes } = require("mongoose");
const Product = require('./Product.model')

const orderSchema = new Schema(
  {
    userId: { type: SchemaTypes.ObjectId, ref: "User", required: true },
    payementStatus: {
      type: String,
      enum: ["paid", "shipped", "received"],
      default: "paid",
    },
    creditCard:{
      cardNumber:{type: String, required:true},
      cvcNumber:{type: String, required:true},
      name:{type: String, required:true}
    },
    totalCost: Number,
    products: [
      {
        productId: { type: SchemaTypes.ObjectId, ref: "Product" },
        quantity: Number,
      },
    ],
    shipping: {
      address: {
        street1: String,
        street2: String,
        city: String,
        state: String,
        country: String,
        zip: String,
      },
    },
  },
  {
    timestamps: true,
  }
);

const Order = model("Order", orderSchema);

module.exports = Order;
