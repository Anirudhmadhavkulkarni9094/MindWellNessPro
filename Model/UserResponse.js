const mongoose = require("mongoose");

const UserResponseSchema = mongoose.Schema({
  name: {
    type: String,
    
  },
  email: {
    type: String,
    
  },
  age: {
    type: String,
    
  },
  responses: [],
  questions : [],
  category : {
    type : String
  },
  Date : {
    type : Date,
    default : Date.now()
  }
});

const UserResponseModel = mongoose.model("UserResponseModel", UserResponseSchema);

module.exports = UserResponseModel;