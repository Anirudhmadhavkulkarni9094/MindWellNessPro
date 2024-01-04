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

// const addUserResponse = 
module.exports = {
    getResponseById,
    deleteResponseById,
    deleteAllResponse,
    // addUserResponse
}