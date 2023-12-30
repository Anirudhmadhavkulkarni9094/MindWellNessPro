const mongoose = require("mongoose");


const TestimonialSchema = new mongoose.Schema({
    author : {
        type : String
    },
    message : {
        type : String
    },
    date : {
        type : Date,
        default : Date.now()
    }
})


const TestimonialModel = new mongoose.model("TestimonialModel" , TestimonialSchema);


module.exports = TestimonialModel