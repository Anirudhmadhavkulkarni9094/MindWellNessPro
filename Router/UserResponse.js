const axios = require("axios");
const UserResponseModel = require("../Model/UserResponse")
const reportModel = require("../Model/Report");
const getResponseById = async (req, res) => {
    const mail = req.params.mail; // Access the mail parameter from the request
    try {
      const data = await UserResponseModel.find({ email: mail.toLowerCase() });
      res.json(data);
    } catch (error) {
      console.error("Error fetching user responses:", error.message);
      res.status(500).json({ error: error.message });
    }
  }

const deleteResponseById = async (req, res) => {
    const id = req.params.id;
  
    try {
      const deletedResponse = await UserResponseModel.findByIdAndDelete(id);
      console.log("response deleted");
      if (!deletedResponse) {
        return res.status(404).json({ message: "User response not found" });
      }
  
      res
        .status(200)
        .json({ message: "User response deleted successfully", deletedResponse });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error deleting user response", error: error.message });
      console.log("response cannot be deleted");
    }
  }

const  deleteAllResponse =  async (req, res) => {
    UserResponseModel.deleteMany({})
      .then(() => {
        console.log("All records deleted successfully");
        res.status(200).json({
          message: "all records deleted",
        });
      })
      .catch((error) => {
        console.error("Error deleting records:", error);
      });
  }

const addUserResponse = async (req, res) => {
    try {
      const { name, email, age, responses, questions } = req.body;
      const newResponse = {
        name: name,
        email: email.toLowerCase(),
        age: age,
        responses: responses,
        questions: questions,
      };
  
      // Check if data with the provided email exists, then delete it
      const existingData = await UserResponseModel.findOneAndDelete({ email: email });
  
      console.log(existingData); // Log the deleted data if found
  
      // Save user response to the database
      const newData = await UserResponseModel.create(newResponse);
      newData.save();
  
      // Making a GET request to sentiment analysis service after saving the user response
      axios
        .get(
          `https://sentimentanalysis-rdb8.onrender.com/senti/sentimentAnalysis/0/${email}`
        )
        .then((sentimentResponse) => {
          const {
            "unique id": uniqueId,
            name,
            email,
            suggestions,
            sentiments_scores,
            status,
          } = sentimentResponse.data;
  
          // Construct sentiment object from the provided scores
          const sentimentScores = sentiments_scores.map((sentiment) => ({
            label: sentiment.label,
            score: sentiment.score,
          }));
  
          const newReport = new reportModel({
            uniqueId: uniqueId,
            name: name,
            email: email,
            suggestions: suggestions,
            sentiment_scores: sentimentScores, // Use sentiment_scores field
            status: status,
          });
  
          // Save sentiment analysis report to the database
          return newReport.save();
        })
        .then(() => {
          res
            .status(201)
            .json({ message: "Data added successfully", data: newData });
        })
        .catch((error) => {
          console.error(
            "Error fetching or saving sentiment analysis report:",
            error
          );
          res
            .status(500)
            .json({ message: "Error processing sentiment analysis" });
        });
    } catch (err) {
      console.error("Error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }

module.exports = {
    getResponseById,
    deleteResponseById,
    deleteAllResponse,
    addUserResponse
}