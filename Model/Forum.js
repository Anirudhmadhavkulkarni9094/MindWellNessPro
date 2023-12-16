const mongoose = require("mongoose")

const ForumSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    category  : {
        type : String
    },
    author : {
        type :  String,
       
    },
    date: {
        type: Date,
        default: Date.now
    },
    comments: [
        {
            text: String,
            date: {
                type: Date,
                default: Date.now
            }
        }
    ]
})


const ForumModel = mongoose.model("ForumContent" , ForumSchema);

module.exports = ForumModel;