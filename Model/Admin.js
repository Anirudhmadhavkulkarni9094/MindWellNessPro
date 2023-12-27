const mongoose = require("mongoose");


const AdminSchema = mongoose.Schema({
    name : {
        type :  String
    },
    email : {
        type : String
    },
    password : {
        type : String
    } , 
    phoneNumber : {
        type : Number
    }, 
    gender : {
        type : String
    },
    status : {
        type : Boolean,
        default : false
    },
    superAdmin  :{
        type : Boolean,
        default : false
    }
})


const AdminModel = mongoose.model("adminModel" , AdminSchema );

module.exports = AdminModel;