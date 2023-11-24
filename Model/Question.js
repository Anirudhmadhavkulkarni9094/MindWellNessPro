const mongoose = require("mongoose");

const QuestionSchema = mongoose.Schema({
    Question : {
        type : String,
        required: true
    },
    Category : {
        type : String,
        required: true
    }
})

const QuestionModel = mongoose.model("Question", QuestionSchema);

module.exports = QuestionModel;