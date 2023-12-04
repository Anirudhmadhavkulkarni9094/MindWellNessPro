const mongoose = require("mongoose")

const reportSchema = mongoose.Schema({
    uniqueId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    suggestions: {
        type: String,
        required: true
    },
    sentiment_scores: [{
        label: String,
        score: Number
    }],
    status: {
        type: Number,
        required: true
    }
});

const reportModel = mongoose.model("Report", reportSchema);

module.exports = reportModel;
