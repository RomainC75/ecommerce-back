const { Schema, SchemaTypes, model } = require("mongoose");

const roomSchema = new Schema({  
  adminId: {
    type: SchemaTypes.ObjectId,
    ref: "Admin"
  },
  userId: {
    type: SchemaTypes.ObjectId,
    ref: "User",
    required:true,
    uniq:true
  }
},{
  timestamps:true
});

const Room = model("Room", roomSchema);

module.exports = Room;
