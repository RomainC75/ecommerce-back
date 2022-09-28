const { Schema, SchemaTypes, model } = require("mongoose");

const messageSchema = new Schema({  
  room:{
    type: SchemaTypes.ObjectId,
    required:true
  },
  senderId: {
    type: SchemaTypes.ObjectId,
    refPath: 'senderType',
    required:true
  },
  receiverId: {
    type: SchemaTypes.ObjectId,
    refPath: 'receiverType',
    required:true
  },
  message: String,
  senderType:{
    type: String,
    required: true,
    enum: ['User','Admin']
  },
  receiverType:{
    type: String,
    required: true,
    enum: ['User','Admin']
  },
  newMessage:{
    type: Boolean,
    required: true,
    default: true
  }
},{
  timestamps:true
});

const Message = model("Message", messageSchema);

module.exports = Message;
