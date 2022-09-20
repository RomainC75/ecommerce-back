const { Schema, model, SchemaTypes } = require("mongoose");

const possibleAdminEmailsSchema = new Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
    }
  },
  {
    timestamps: true,
  }
);

const PossibleAdminEmails = model("possibleAdminEmail", possibleAdminEmailsSchema);

module.exports = PossibleAdminEmails;
