const mongoose = require("mongoose")

const ComplaintSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    message  : {
        type : String,
        required : true 
    },
    status  : {
        type : String,
        default: "Unresolved"
    },
    date: {
        type: Date,
        default: Date.now
    }
})


const ComplaintModel = mongoose.model("Complaints" , ComplaintSchema);

module.exports = ComplaintModel;