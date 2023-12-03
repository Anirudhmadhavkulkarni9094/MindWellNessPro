const express = require("express")
const mongoose = require("mongoose");


const reportSchema = mongoose.Schema({
    uniqueId: {
        type : String,
        required: true
    },
    name : {
        type : String,
        required: true
    },
    email : {
        type : String,
        required: true
    },
    suggestions : {
        type  :String,
        required: true
    },
    sentiment : {
        type : String,
        required: true
    },
    score : {
        type : Number,
        required: true
    }
})

const reportModel = mongoose.model("Report" , reportSchema);

module.exports = reportModel