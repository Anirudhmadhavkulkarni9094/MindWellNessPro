const express = require("express");
const app = express();

const cors = require("cors");
const QuestionModel = require("../Model/Question");
app.use(cors());




const getQuestions = async (req, res) => {
    try {
      const questions = await QuestionModel.find({});
      res.json(questions);
    } catch (err) {
      console.error("Error fetching questions:", err);
      res.status(500).json({ error: "Failed to fetch questions" });
    }
  }

  const addQuestion = async (req, res) => {
    try {
      const { Question, Category, Option } = req.body; // Assuming you pass the question in the request body
      const newQuestion = await QuestionModel.create({
        Question: Question,
        Category: Category,
        Option: Option.split(",").map(option => option.trim()) // Splitting options into an array
      });
      res.status(201).json(newQuestion);
    } catch (err) {
      console.error("Error adding question:", err);
      res.status(500).json({ error: "Failed to add question" });
    }
  }
  

  const deleteQuestionbyId = async (req, res) => {
    try {
      const { id } = req.params;
      const deletedQuestion = await QuestionModel.findOneAndDelete({ _id: id });
  
      if (!deletedQuestion) {
        return res.status(404).json({ error: "Question not found" });
      }
  
      res
        .status(200)
        .json({ message: "Question deleted successfully", deletedQuestion });
    } catch (err) {
      console.error("Error deleting question:", err);
      res.status(500).json({ error: "Failed to delete question" });
    }
  }

module.exports = {
    getQuestions,
    addQuestion,
    deleteQuestionbyId
}