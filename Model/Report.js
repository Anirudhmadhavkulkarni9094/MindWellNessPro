const express = require("express")
const mongoose = require("mongoose");


const reportSchema = mongoose.Schema({
    uniqueId: {
        type : String,
        required: true
    },
    name : {
        type : String
    },
    email : {
        type : String,
    },
    data : {
        type : [String]
    }
})

const reportModel = mongoose.model("Report" , reportSchema);

module.exports = reportModel