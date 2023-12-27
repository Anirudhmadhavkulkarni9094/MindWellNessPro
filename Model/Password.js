const mongoose = require("mongoose")

const passwordSchema = mongoose.Schema({
    email : {
        type : String,
    },
    password : {
        type : String
    }
})

const passwordModel = new mongoose.model("password" , passwordSchema);

module.exports = passwordModel;