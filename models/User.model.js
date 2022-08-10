const { Schema, model, SchemaTypes } = require("mongoose");

const userSchema = new Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: { type: SchemaTypes.String, required: true },
    firstName: String,
    lastName: String,
      street1: String,
      street2: String,
      city: String,
      zip: String,
      state: String,
      country: String,
    
    isMailValidated: {
      type: Boolean,
      default: false,
    },
    emailValidationCode: {
      type:Number,
      required:true
    }
  },
  {
    timestamps: true,
  }
);

const User = model("User", userSchema);

module.exports = User;
