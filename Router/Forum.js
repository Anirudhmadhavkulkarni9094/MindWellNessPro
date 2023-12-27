const express = require("express");
const app = express();
const cors = require("cors");
const ForumModel = require("../Model/Forum");
app.use(cors());


const getForumByCategory = async (req, res) => {
    const category = req.params.category;
    const data = await ForumModel.find({ category: category });
    res.status(200).json({
      data: data,
    });
  }

  const addForum =  async (req, res) => {
    try {
      const { title, author, content, category } = req.body; // Remove 'await' here
  
      const newData = new ForumModel({
        title,
        author,
        category,
        content,
      });
  
      await newData.save();
  
      res.status(200).json({
        message: "Data added successfully",
      });
    } catch (err) {
      res.status(500).json({
        message: "Data cannot be uploaded",
        error: err.message, // Include the error message for debugging
      });
    }
  }
  module.exports = {
    getForumByCategory,
    addForum
  }